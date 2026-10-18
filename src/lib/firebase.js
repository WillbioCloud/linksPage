import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

// Configuração padrão completa da propriedade com disponibilidade e temas
export const DEFAULT_PROPERTY = {
  titulo: "Home Paraíso",
  cidade: "Caldas Novas · GO",
  descricao:
    "Viva momentos inesquecíveis na Home Paraíso em Caldas Novas. Um refúgio exclusivo de alto padrão com piscina aquecida privativa, cascata, área gourmet completa com churrasqueira e suítes climatizadas com todo o requinte e privacidade que você e sua família merecem.",
  valor_diaria: "R$ 650",
  valor_diaria_num: 650,
  link_whatsapp: "https://wa.me/5564999999999",
  tema: "modern-app", // 'modern-app' | 'vidro' | 'neumorfismo' | 'obsidiana' | 'brutalista' | 'salvia' | 'retro' | 'ocean' | 'forest' | 'luxury'
  max_hospedes: 10,
  mostrar_calendario: true,
  // Mapa de datas ocupadas: { "YYYY-MM-DD": { origem: 'airbnb' | 'booking' | 'direto' | 'bloqueado', nota?: string } }
  datas_ocupadas: {
    "2026-05-01": { origem: "airbnb", nota: "Feriado do Trabalho" },
    "2026-05-02": { origem: "airbnb", nota: "Feriado do Trabalho" },
    "2026-05-03": { origem: "airbnb", nota: "Feriado do Trabalho" },
    "2026-05-15": { origem: "booking", nota: "Hóspedes Booking" },
    "2026-05-16": { origem: "booking", nota: "Hóspedes Booking" },
    "2026-05-22": { origem: "direto", nota: "Reserva WhatsApp Família Silva" },
    "2026-05-23": { origem: "direto", nota: "Reserva WhatsApp Família Silva" },
    "2026-05-24": { origem: "direto", nota: "Reserva WhatsApp Família Silva" },
  },
  imagens: [
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
  ],
};

const LOCAL_STORAGE_KEY = "home_paraiso_property_data_v2";

// Credenciais do Firebase vindas das variáveis de ambiente (Vite)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.apiKey !== "SUA_API_KEY"
  );
};

let db = null;

if (isFirebaseConfigured()) {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.warn("Aviso ao inicializar Firebase:", error);
  }
}

export const getLocalProperty = () => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_PROPERTY, ...JSON.parse(stored) };
    }
  } catch (err) {
    console.error("Erro ao ler localStorage:", err);
  }
  return DEFAULT_PROPERTY;
};

export const saveLocalProperty = (data) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Erro ao salvar no localStorage:", err);
  }
};

export const subscribeToProperty = (onData, onError) => {
  const initial = getLocalProperty();
  onData(initial);

  if (!db) {
    return () => {};
  }

  try {
    const docRef = doc(db, "propriedades", "home-paraiso");
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const remoteData = docSnap.data();
          const merged = { ...DEFAULT_PROPERTY, ...remoteData };
          saveLocalProperty(merged);
          onData(merged);
        } else {
          savePropertyToFirebase(initial).catch(() => {});
        }
      },
      (error) => {
        console.warn("Erro ao escutar Firestore (usando dados locais):", error);
        onError?.(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn("Erro ao configurar listener do Firestore:", err);
    onError?.(err);
    return () => {};
  }
};

export const savePropertyToFirebase = async (propertyData) => {
  saveLocalProperty(propertyData);

  if (!db) {
    return {
      success: true,
      mode: "local",
      message:
        "Salvo localmente com sucesso! (Adicione as chaves do Firebase para sincronizar na nuvem)",
    };
  }

  try {
    const docRef = doc(db, "propriedades", "home-paraiso");
    await setDoc(docRef, propertyData, { merge: true });
    return {
      success: true,
      mode: "cloud",
      message: "Propriedade atualizada com sucesso no Firebase!",
    };
  } catch (error) {
    console.error("Erro ao salvar no Firestore:", error);
    throw error;
  }
};
