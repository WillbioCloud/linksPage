import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// Configuração padrão completa da propriedade Home Paraíso
export const DEFAULT_PROPERTY = {
  titulo: "Home Paraíso",
  cidade: "Caldas Novas · GO",
  descricao:
    "Viva momentos inesquecíveis na Home Paraíso em Caldas Novas. Um refúgio exclusivo de alto padrão com piscina aquecida privativa, cascata, área gourmet completa com churrasqueira e suítes climatizadas com todo o requinte e privacidade que você e sua família merecem.",
  valor_diaria: "R$ 650",
  valor_diaria_num: 650,
  valor_diaria_base: 650, // Diária base para dias comuns
  precos_personalizados: {}, // Mapa de diárias específicas: { "YYYY-MM-DD": 750 }
  link_whatsapp: "https://wa.me/5564999999999",
  tema: "modern-app", // 'modern-app' | 'vidro' | 'neumorfismo' | 'obsidiana' | 'brutalista' | 'salvia' | 'retro' | 'ocean' | 'forest' | 'luxury'
  max_hospedes: 10,
  quartos: 3,
  suites: 1,
  banheiros: 3,
  vagas_garagem: 2,
  mostrar_calendario: true,
  // Mapa de datas ocupadas: { "YYYY-MM-DD": { origem: 'airbnb' | 'booking' | 'direto' | 'bloqueado', nota?: string } }
  datas_ocupadas: {},
  imagens: [],
  faqs: [
    {
      q: "Qual o horário de check-in e check-out?",
      a: "O check-in padrão é a partir das 8:00 e o check-out até às 11:00. Caso precise de horários flexíveis, converse diretamente pelo WhatsApp para verificar disponibilidade.",
    },
    {
      q: "A piscina é realmente aquecida?",
      a: "Sim! A piscina conta com aquecimento térmico constante e cascata.",
    },
    {
      q: "Como funciona a reserva direta?",
      a: "A reserva é feita diretamente com a proprietária, sem taxas abusivas de intermediários. Você recebe confirmação imediata, orientações de chegada e suporte dedicado.",
    },
    {
      q: "A casa aceita animais de estimação (pets)?",
      a: "Sim, aceitamos pets de pequeno porte com aviso prévio na reserva para mantermos o padrão de higiene e conservação.",
    },
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

// Inicializa o app, Firestore e Auth
let db = null;
let auth = null;
const googleProvider = new GoogleAuthProvider();

try {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.warn("Aviso ao inicializar Firebase Firestore/Auth:", error);
}

export { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged, 
  db 
};

export const getLocalProperty = () => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_PROPERTY,
        ...parsed,
        datas_ocupadas: parsed.datas_ocupadas || {},
        precos_personalizados: parsed.precos_personalizados || {},
        imagens: Array.isArray(parsed.imagens) ? parsed.imagens : [],
        faqs: Array.isArray(parsed.faqs) && parsed.faqs.length > 0 ? parsed.faqs : DEFAULT_PROPERTY.faqs,
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
          const merged = {
            ...DEFAULT_PROPERTY,
            ...remoteData,
            datas_ocupadas: remoteData.datas_ocupadas || {},
            precos_personalizados: remoteData.precos_personalizados || {},
            imagens: Array.isArray(remoteData.imagens) ? remoteData.imagens : [],
            faqs: Array.isArray(remoteData.faqs) && remoteData.faqs.length > 0 ? remoteData.faqs : DEFAULT_PROPERTY.faqs,
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
