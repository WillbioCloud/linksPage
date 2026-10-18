import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

// Configuração padrão da propriedade caso o Firebase ainda não tenha dados
export const DEFAULT_PROPERTY = {
  titulo: "Home Paraíso",
  descricao:
    "Viva momentos inesquecíveis na Home Paraíso em Caldas Novas. Um refúgio exclusivo de alto padrão com piscina aquecida privativa, cascata, área gourmet completa com churrasqueira e suítes climatizadas com todo o requinte e privacidade que você e sua família merecem.",
  valor_diaria: "R$ 650",
  link_whatsapp:
    "https://wa.me/5564999999999?text=Ol%C3%A1!%20Gostaria%20de%20consultar%20disponibilidade%20para%20a%20Home%20Para%C3%ADso.",
  tema: "ocean", // 'ocean' | 'forest' | 'luxury'
  imagens: [
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  ],
};

const LOCAL_STORAGE_KEY = "home_paraiso_property_data";

// Credenciais do Firebase vindas das variáveis de ambiente (Vite)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Verifica se as credenciais mínimas do Firebase foram fornecidas
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

/**
 * Lê do LocalStorage como fallback imediato
 */
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

/**
 * Salva no LocalStorage como backup resiliente
 */
export const saveLocalProperty = (data) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Erro ao salvar no localStorage:", err);
  }
};

/**
 * Escuta atualizações em tempo real do documento 'propriedades/home-paraiso' no Firestore.
 * Se o Firebase não estiver configurado, usa fallback com LocalStorage.
 */
export const subscribeToProperty = (onData, onError) => {
  // Retorna os dados locais imediatamente para não travar a UI
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
          // Se o documento ainda não existir na nuvem, inicializa com o padrão
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

/**
 * Salva os dados da propriedade no Firestore (propriedades/home-paraiso)
 * e também atualiza o cache local.
 */
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
