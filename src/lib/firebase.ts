import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  getDocFromServer,
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  ModelProfile,
  ChatMessage,
  UserMemory,
  UserSession,
  ModelMediaItem,
  ModelVoiceClip,
} from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if configured
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Test connection on boot as mandated by Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.info('Firestore connection validated successfully');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline mode or waiting for initial online sync');
    }
    return false;
  }
}

// Clean document ID for Firestore
export function sanitizeDocId(id: string): string {
  if (!id) return 'unspecified';
  return id.replace(/[^a-zA-Z0-9_-]/g, '_');
}

// ============================================================================
// UNIFIED FIRESTORE SERVICE LAYER FOR AURAAGENT
// ============================================================================

export interface SyncLoginResult {
  session: UserSession;
  modelProfile?: ModelProfile;
  mediaVault: ModelMediaItem[];
  voiceClips: ModelVoiceClip[];
  memory?: UserMemory | null;
  messages?: ChatMessage[] | null;
  preferences?: Record<string, any>;
}

export interface SyncLogoutContext {
  modelProfile?: ModelProfile;
  userMemory?: UserMemory;
  messages?: ChatMessage[];
  activeUsername?: string;
  preferences?: Record<string, any>;
}

export class AuraUnifiedPersistenceService {
  // --------------------------------------------------------------------------
  // USER PROFILE & SESSION PERSISTENCE
  // --------------------------------------------------------------------------

  /**
   * Persists user session, role, avatar, and preferences to /users/{userId}
   */
  async saveUserProfile(session: UserSession): Promise<void> {
    try {
      const cleanUserId = sanitizeDocId(session.id || session.handle || session.email || 'user_default');
      const docRef = doc(db, 'users', cleanUserId);
      const payload = {
        id: session.id,
        name: session.name,
        email: session.email || '',
        handle: session.handle || '',
        avatar: session.avatar || '',
        role: session.role || 'creator',
        provider: session.provider || 'x',
        connectedAt: session.connectedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        xAccountConnected: Boolean(session.xAccountConnected),
        associatedModelId: session.associatedModelId || '',
        allowedModelIds: session.allowedModelIds || [],
        preferences: session.preferences || {},
      };
      await setDoc(docRef, payload, { merge: true });
    } catch (err) {
      console.warn('UnifiedService: Error saving user profile to Firestore:', err);
    }
  }

  /**
   * Fetches user session and preferences from /users/{userId}
   */
  async fetchUserProfile(userId: string): Promise<UserSession | null> {
    try {
      const cleanUserId = sanitizeDocId(userId);
      const docRef = doc(db, 'users', cleanUserId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as UserSession;
      }
    } catch (err) {
      console.warn('UnifiedService: Error fetching user profile from Firestore:', err);
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // MODEL PROFILE PERSISTENCE
  // --------------------------------------------------------------------------

  /**
   * Persists a model profile (including voice DNA, pricing, rules, bio) to /models/{modelId}
   */
  async saveModelProfile(model: ModelProfile): Promise<void> {
    try {
      const cleanModelId = sanitizeDocId(model.id);
      const docRef = doc(db, 'models', cleanModelId);
      await setDoc(
        docRef,
        {
          ...model,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('UnifiedService: Error saving model profile to Firestore:', err);
    }
  }

  /**
   * Fetches a specific model profile from /models/{modelId}
   */
  async fetchModelProfile(modelId: string): Promise<ModelProfile | null> {
    try {
      const cleanModelId = sanitizeDocId(modelId);
      const docRef = doc(db, 'models', cleanModelId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as ModelProfile;
      }
    } catch (err) {
      console.warn('UnifiedService: Error fetching model profile from Firestore:', err);
    }
    return null;
  }

  /**
   * Fetches all model profiles from /models
   */
  async fetchAllModels(): Promise<ModelProfile[]> {
    try {
      const colRef = collection(db, 'models');
      const snapshot = await getDocs(colRef);
      const models: ModelProfile[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as ModelProfile;
        if (data && data.id && data.name) {
          models.push(data);
        }
      });
      return models;
    } catch (err) {
      console.warn('UnifiedService: Error fetching all models from Firestore:', err);
      return [];
    }
  }

  // --------------------------------------------------------------------------
  // MEDIA VAULT (PHOTOS) PERSISTENCE
  // --------------------------------------------------------------------------

  /**
   * Persists a photo to /models/{modelId}/mediaVault/{photoId}
   */
  async saveMediaItem(modelId: string, item: ModelMediaItem): Promise<void> {
    try {
      const cleanModelId = sanitizeDocId(modelId);
      const cleanItemId = sanitizeDocId(item.id);
      const docRef = doc(db, 'models', cleanModelId, 'mediaVault', cleanItemId);
      await setDoc(
        docRef,
        {
          ...item,
          modelId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('UnifiedService: Error saving media item to Firestore:', err);
    }
  }

  /**
   * Fetches all media items for a model from /models/{modelId}/mediaVault
   */
  async fetchMediaItems(modelId: string): Promise<ModelMediaItem[]> {
    try {
      const cleanModelId = sanitizeDocId(modelId);
      const colRef = collection(db, 'models', cleanModelId, 'mediaVault');
      const snapshot = await getDocs(colRef);
      const items: ModelMediaItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as ModelMediaItem;
        if (data && data.id && data.url) {
          items.push(data);
        }
      });
      return items;
    } catch (err) {
      console.warn('UnifiedService: Error fetching media items from Firestore:', err);
      return [];
    }
  }

  /**
   * Deletes a photo from /models/{modelId}/mediaVault/{photoId}
   */
  async deleteMediaItem(modelId: string, itemId: string): Promise<void> {
    try {
      const cleanModelId = sanitizeDocId(modelId);
      const cleanItemId = sanitizeDocId(itemId);
      const docRef = doc(db, 'models', cleanModelId, 'mediaVault', cleanItemId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('UnifiedService: Error deleting media item from Firestore:', err);
    }
  }

  // --------------------------------------------------------------------------
  // VOICE VAULT (AUDIO CLIPS & CLONES) PERSISTENCE
  // --------------------------------------------------------------------------

  /**
   * Persists a voice note or cloned audio to /models/{modelId}/voiceVault/{clipId}
   */
  async saveVoiceClip(modelId: string, clip: ModelVoiceClip): Promise<void> {
    try {
      const cleanModelId = sanitizeDocId(modelId);
      const cleanClipId = sanitizeDocId(clip.id);
      const docRef = doc(db, 'models', cleanModelId, 'voiceVault', cleanClipId);
      await setDoc(
        docRef,
        {
          ...clip,
          modelId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('UnifiedService: Error saving voice clip to Firestore:', err);
    }
  }

  /**
   * Fetches all voice clips for a model from /models/{modelId}/voiceVault
   */
  async fetchVoiceClips(modelId: string): Promise<ModelVoiceClip[]> {
    try {
      const cleanModelId = sanitizeDocId(modelId);
      const colRef = collection(db, 'models', cleanModelId, 'voiceVault');
      const snapshot = await getDocs(colRef);
      const clips: ModelVoiceClip[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as ModelVoiceClip;
        if (data && data.id) {
          clips.push(data);
        }
      });
      return clips;
    } catch (err) {
      console.warn('UnifiedService: Error fetching voice clips from Firestore:', err);
      return [];
    }
  }

  /**
   * Deletes an audio clip from /models/{modelId}/voiceVault/{clipId}
   */
  async deleteVoiceClip(modelId: string, clipId: string): Promise<void> {
    try {
      const cleanModelId = sanitizeDocId(modelId);
      const cleanClipId = sanitizeDocId(clipId);
      const docRef = doc(db, 'models', cleanModelId, 'voiceVault', cleanClipId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('UnifiedService: Error deleting voice clip from Firestore:', err);
    }
  }

  // --------------------------------------------------------------------------
  // CRM LEADS & PSYCHOLOGICAL MEMORY PERSISTENCE
  // --------------------------------------------------------------------------

  /**
   * Persists learned psychological memory for a contact in /models/{modelId}/leads/{leadId}
   */
  async saveUserMemory(modelId: string, username: string, memory: UserMemory): Promise<void> {
    try {
      const cleanModelId = sanitizeDocId(modelId);
      const cleanLeadId = sanitizeDocId(username);
      const docRef = doc(db, 'models', cleanModelId, 'leads', cleanLeadId);
      await setDoc(
        docRef,
        {
          ...memory,
          username,
          modelId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('UnifiedService: Error saving lead memory to Firestore:', err);
    }
  }

  /**
   * Fetches learned psychological memory for a contact from /models/{modelId}/leads/{leadId}
   */
  async fetchUserMemory(modelId: string, username: string): Promise<UserMemory | null> {
    try {
      const cleanModelId = sanitizeDocId(modelId);
      const cleanLeadId = sanitizeDocId(username);
      const docRef = doc(db, 'models', cleanModelId, 'leads', cleanLeadId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as UserMemory;
      }
    } catch (err) {
      console.warn('UnifiedService: Error fetching lead memory from Firestore:', err);
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // CHAT MESSAGES PERSISTENCE
  // --------------------------------------------------------------------------

  /**
   * Persists chat messages array to /models/{modelId}/chats/{chatId}
   */
  async saveChatMessages(modelId: string, username: string, messages: ChatMessage[]): Promise<void> {
    try {
      const cleanModelId = sanitizeDocId(modelId);
      const cleanChatId = sanitizeDocId(username);
      const docRef = doc(db, 'models', cleanModelId, 'chats', cleanChatId);
      await setDoc(
        docRef,
        {
          modelId,
          username,
          messages,
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('UnifiedService: Error saving chat messages to Firestore:', err);
    }
  }

  /**
   * Fetches chat messages array from /models/{modelId}/chats/{chatId}
   */
  async fetchChatMessages(modelId: string, username: string): Promise<ChatMessage[] | null> {
    try {
      const cleanModelId = sanitizeDocId(modelId);
      const cleanChatId = sanitizeDocId(username);
      const docRef = doc(db, 'models', cleanModelId, 'chats', cleanChatId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (Array.isArray(data?.messages)) {
          return data.messages as ChatMessage[];
        }
      }
    } catch (err) {
      console.warn('UnifiedService: Error fetching chat messages from Firestore:', err);
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // UNIFIED LIFECYCLE SYNC: LOGIN & LOGOUT STATE MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Synchronizes all profile, audio, photo, and preference data on LOGIN
   * Prevents any state reset or loss across sessions/devices.
   */
  async syncOnLogin(
    session: UserSession,
    defaultModel?: ModelProfile,
    activeUsername: string = '@carlos_m92'
  ): Promise<SyncLoginResult> {
    let syncedSession = { ...session };
    let syncedModel: ModelProfile | undefined = defaultModel;
    let mediaVault: ModelMediaItem[] = [];
    let voiceClips: ModelVoiceClip[] = [];
    let memory: UserMemory | null = null;
    let messages: ChatMessage[] | null = null;
    let preferences: Record<string, any> = session.preferences || {};

    try {
      // 1. Rehydrate user profile & preferences from Firestore
      const existingUser = await this.fetchUserProfile(session.id || session.handle || session.email || '');
      if (existingUser) {
        syncedSession = {
          ...syncedSession,
          avatar: existingUser.avatar || syncedSession.avatar,
          preferences: { ...(existingUser.preferences || {}), ...(session.preferences || {}) },
          associatedModelId: existingUser.associatedModelId || syncedSession.associatedModelId,
        };
        preferences = syncedSession.preferences || {};
      }

      // Update /users doc with active login timestamp
      await this.saveUserProfile(syncedSession);

      // 2. Identify target model ID to load
      const targetModelId =
        syncedSession.associatedModelId ||
        preferences.activeModelId ||
        defaultModel?.id ||
        'afire-sb';

      // 3. Rehydrate model profile from Firestore
      const loadedModel = await this.fetchModelProfile(targetModelId);
      if (loadedModel) {
        syncedModel = {
          ...(defaultModel || {}),
          ...loadedModel,
        } as ModelProfile;
      } else if (defaultModel) {
        // First-time seed of model profile to Firestore
        await this.saveModelProfile(defaultModel);
        syncedModel = defaultModel;
      }

      // 4. Rehydrate media vault (photos) from Firestore
      if (syncedModel?.id) {
        const loadedPhotos = await this.fetchMediaItems(syncedModel.id);
        const defaultPhotos = syncedModel.mediaVault || [];
        const map = new Map<string, ModelMediaItem>();
        defaultPhotos.forEach((p) => map.set(p.id, p));
        loadedPhotos.forEach((p) => map.set(p.id, p));
        mediaVault = Array.from(map.values());
        syncedModel.mediaVault = mediaVault;
      }

      // 5. Rehydrate voice clips & cloned audio from Firestore
      if (syncedModel?.id) {
        const loadedClips = await this.fetchVoiceClips(syncedModel.id);
        const defaultClips = syncedModel.voiceClips || [];
        const map = new Map<string, ModelVoiceClip>();
        defaultClips.forEach((c) => map.set(c.id, c));
        loadedClips.forEach((c) => map.set(c.id, c));
        voiceClips = Array.from(map.values());
        syncedModel.voiceClips = voiceClips;
      }

      // 6. Rehydrate psychological memory and CRM leads
      if (syncedModel?.id) {
        memory = await this.fetchUserMemory(syncedModel.id, activeUsername);
      }

      // 7. Rehydrate persistent chat history
      if (syncedModel?.id) {
        messages = await this.fetchChatMessages(syncedModel.id, activeUsername);
      }

      // Backup to localStorage for ultra-fast local hydration
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('aura_current_session', JSON.stringify(syncedSession));
          if (syncedModel) {
            localStorage.setItem('aura_active_model', JSON.stringify(syncedModel));
          }
        } catch (e) {}
      }

      console.info(`UnifiedService: Login sync completed for ${syncedSession.name} (${syncedModel?.name})`);
    } catch (err) {
      console.warn('UnifiedService: Login sync error (retaining local state):', err);
    }

    return {
      session: syncedSession,
      modelProfile: syncedModel,
      mediaVault,
      voiceClips,
      memory,
      messages,
      preferences,
    };
  }

  /**
   * Synchronizes and flushes all session data to Firestore on LOGOUT
   * Ensures nothing is lost when the user closes or exits the session.
   */
  async syncOnLogout(
    session: UserSession | null,
    context?: SyncLogoutContext
  ): Promise<void> {
    try {
      // 1. Flush user session & preferences
      if (session) {
        const updatedSession: UserSession = {
          ...session,
          updatedAt: new Date().toISOString(),
          preferences: {
            ...(session.preferences || {}),
            ...(context?.preferences || {}),
            lastLogoutAt: new Date().toISOString(),
          },
        };
        await this.saveUserProfile(updatedSession);
      }

      // 2. Flush current model profile (voice DNA, voice settings, avatar, pricing)
      if (context?.modelProfile) {
        await this.saveModelProfile(context.modelProfile);

        // Flush media vault photos
        if (context.modelProfile.mediaVault && context.modelProfile.mediaVault.length > 0) {
          for (const photo of context.modelProfile.mediaVault) {
            await this.saveMediaItem(context.modelProfile.id, photo);
          }
        }

        // Flush voice vault clips
        if (context.modelProfile.voiceClips && context.modelProfile.voiceClips.length > 0) {
          for (const clip of context.modelProfile.voiceClips) {
            await this.saveVoiceClip(context.modelProfile.id, clip);
          }
        }

        // Flush psychological memory
        if (context.userMemory && context.activeUsername) {
          await this.saveUserMemory(context.modelProfile.id, context.activeUsername, context.userMemory);
        }

        // Flush chat messages
        if (context.messages && context.messages.length > 0 && context.activeUsername) {
          await this.saveChatMessages(context.modelProfile.id, context.activeUsername, context.messages);
        }
      }

      console.info('UnifiedService: Logout sync completed successfully. All data persisted.');
    } catch (err) {
      console.warn('UnifiedService: Logout sync warning:', err);
    }
  }
}

// Export singleton instance of unified service
export const auraSyncService = new AuraUnifiedPersistenceService();

// ============================================================================
// BACKWARD-COMPATIBLE NAMED EXPORTS
// ============================================================================

export const persistModelToFirestore = (model: ModelProfile) => auraSyncService.saveModelProfile(model);
export const fetchAllModelsFromFirestore = () => auraSyncService.fetchAllModels();
export const persistMediaItemToFirestore = (modelId: string, item: any) => auraSyncService.saveMediaItem(modelId, item);
export const fetchMediaItemsFromFirestore = (modelId: string) => auraSyncService.fetchMediaItems(modelId);
export const deleteMediaItemFromFirestore = (modelId: string, itemId: string) => auraSyncService.deleteMediaItem(modelId, itemId);
export const persistVoiceClipToFirestore = (modelId: string, clip: any) => auraSyncService.saveVoiceClip(modelId, clip);
export const fetchVoiceClipsFromFirestore = (modelId: string) => auraSyncService.fetchVoiceClips(modelId);
export const deleteVoiceClipFromFirestore = (modelId: string, clipId: string) => auraSyncService.deleteVoiceClip(modelId, clipId);
export const persistLeadMemoryToFirestore = (modelId: string, username: string, memory: UserMemory) => auraSyncService.saveUserMemory(modelId, username, memory);
export const fetchLeadMemoryFromFirestore = (modelId: string, username: string) => auraSyncService.fetchUserMemory(modelId, username);
export const persistChatMessagesToFirestore = (modelId: string, username: string, messages: ChatMessage[]) => auraSyncService.saveChatMessages(modelId, username, messages);
export const fetchChatMessagesFromFirestore = (modelId: string, username: string) => auraSyncService.fetchChatMessages(modelId, username);
