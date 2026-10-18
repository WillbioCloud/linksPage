import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

// Configuração padrão completa da propriedade Home Paraíso
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
  // Mapa de datas ocupadas padrão: { "YYYY-MM-DD": { origem: 'airbnb' | 'booking' | 'direto' | 'bloqueado', nota?: string } }
  datas_ocupadas: {
    "2026-10-21": { origem: "airbnb", nota: "Reserva Airbnb" },
    "2026-10-22": { origem: "airbnb", nota: "Reserva Airbnb" },
    "2026-10-23": { origem: "airbnb", nota: "Reserva Airbnb" },
    "2026-10-27": { origem: "booking", nota: "Hóspedes Booking" },
    "2026-10-28": { origem: "booking", nota: "Hóspedes Booking" },
    "2026-10-29": { origem: "booking", nota: "Hóspedes Booking" },
    "2026-11-06": { origem: "direto", nota: "Reserva WhatsApp Família Silva" },
    "2026-11-07": { origem: "direto", nota: "Reserva WhatsApp Família Silva" },
    "2026-11-08": { origem: "direto", nota: "Reserva WhatsApp Família Silva" },
    "2026-11-14": { origem: "bloqueado", nota: "Manutenção / Uso Próprio" },
    "2026-11-15": { origem: "bloqueado", nota: "Manutenção / Uso Próprio" },
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

const LOCAL_STORAGE_KEY = "home_paraiso_property_data_v4";

// Configuração oficial do Firebase da Home Paraíso
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyCKRqA6sft_PtiXDhyKiVn7a-LYbZdIV5w",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "home-paraiso.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    "home-paraiso",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "home-paraiso.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "892480658780",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:892480658780:web:d25a585871522778277599",
};

export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.apiKey !== "SUA_API_KEY"
  );
};

// Inicializa o app e o Firestore
let db = null;

try {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.warn("Aviso ao inicializar Firebase Firestore:", error);
}

export const getLocalProperty = () => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_PROPERTY,
        ...parsed,
        datas_ocupadas: parsed.datas_ocupadas !== undefined ? parsed.datas_ocupadas : DEFAULT_PROPERTY.datas_ocupadas,
        imagens: Array.isArray(parsed.imagens) ? parsed.imagens : DEFAULT_PROPERTY.imagens,
      };
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

/**
 * Escuta em tempo real o documento 'propriedades/home-paraiso' no Firestore.
 * Se o documento ainda não existir no banco, ele cria automaticamente!
 */
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
          // O que está no Firestore tem prioridade total e reflete o que o usuário gerencia no painel
          const merged = {
            ...DEFAULT_PROPERTY,
            ...remoteData,
            datas_ocupadas: remoteData.datas_ocupadas !== undefined ? remoteData.datas_ocupadas : DEFAULT_PROPERTY.datas_ocupadas,
            imagens: Array.isArray(remoteData.imagens) ? remoteData.imagens : DEFAULT_PROPERTY.imagens,
          };
          saveLocalProperty(merged);
          onData(merged);
        } else {
          // Se ainda não existir no Firestore, grava o primeiro documento inicial
          savePropertyToFirebase(initial).catch((err) => {
            console.warn("Criando documento inicial no Firestore:", err);
          });
        }
      },
      (error) => {
        console.warn("Erro no listener do Firestore (usando fallback local):", error);
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

/**
 * Salva ou atualiza os dados da propriedade no Firestore
 */
export const savePropertyToFirebase = async (propertyData) => {
  saveLocalProperty(propertyData);

  if (!db) {
    return {
      success: true,
      mode: "local",
      message: "Salvo localmente com sucesso!",
    };
  }

  try {
    const docRef = doc(db, "propriedades", "home-paraiso");
    await setDoc(docRef, propertyData, { merge: true });
    return {
      success: true,
      mode: "cloud",
      message: "Propriedade atualizada com sucesso no Firebase Firestore!",
    };
  } catch (error) {
    console.error("Erro ao salvar no Firestore:", error);
    throw error;
  }
};
