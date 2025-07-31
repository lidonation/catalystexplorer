import { useReducer } from 'react';

export enum ModalType {
    NONE = 'NONE',
    PROFILE_FIELD = 'PROFILE_FIELD',
    SOCIAL_PROFILES = 'SOCIAL_PROFILES',
    PASSWORD = 'PASSWORD',
  }

interface ProfileState {
  isPublic: boolean;
  currentModal: ModalType;
  modalConfig: {
    title: string;
    fieldName: string;
    fieldLabel: string;
    currentValue: string;
    updateRoute: string;
    inputType?: string;
    placeholder?: string;
  };
  photoPreview: string | null;
  photoUploading: boolean;
  photoError: string;
  copySuccess: boolean;
}

type ProfileAction =
  | { type: 'SET_PUBLIC', payload: boolean }
  | { type: 'SET_CURRENT_MODAL', payload: ModalType }
  | { type: 'SET_MODAL_CONFIG', payload: Partial<ProfileState['modalConfig']> }
  | { type: 'SET_PHOTO_PREVIEW', payload: string | null }
  | { type: 'SET_PHOTO_UPLOADING', payload: boolean }
  | { type: 'SET_PHOTO_ERROR', payload: string }
  | { type: 'SET_COPY_SUCCESS', payload: boolean }
  | { type: 'CLOSE_MODAL' };

const initialState: ProfileState = {
  isPublic: true,
  currentModal: ModalType.NONE,
  modalConfig: {
    title: '',
    fieldName: '',
    fieldLabel: '',
    currentValue: '',
    updateRoute: '',
    inputType: 'text',
    placeholder: '',
  },
  photoPreview: null,
  photoUploading: false,
  photoError: '',
  copySuccess: false,
};

function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case 'SET_PUBLIC':
      return { ...state, isPublic: action.payload };
    case 'SET_CURRENT_MODAL':
      return { ...state, currentModal: action.payload };
    case 'SET_MODAL_CONFIG':
      return {
        ...state,
        modalConfig: { ...state.modalConfig, ...action.payload }
      };
    case 'SET_PHOTO_PREVIEW':
      return { ...state, photoPreview: action.payload };
    case 'SET_PHOTO_UPLOADING':
      return { ...state, photoUploading: action.payload };
    case 'SET_PHOTO_ERROR':
      return { ...state, photoError: action.payload };
    case 'SET_COPY_SUCCESS':
      return { ...state, copySuccess: action.payload };
    case 'CLOSE_MODAL':
      return { ...state, currentModal: ModalType.NONE };
    default:
      return state;
  }
}

export default function useProfileState() {
  const [state, dispatch] = useReducer(profileReducer, initialState);

  return {
    state,
    setIsPublic: (value: boolean) => dispatch({ type: 'SET_PUBLIC', payload: value }),
    setCurrentModal: (type: ModalType) => dispatch({ type: 'SET_CURRENT_MODAL', payload: type }),
    setModalConfig: (config: Partial<ProfileState['modalConfig']>) => dispatch({ type: 'SET_MODAL_CONFIG', payload: config }),
    setPhotoPreview: (url: string | null) => dispatch({ type: 'SET_PHOTO_PREVIEW', payload: url }),
    setPhotoUploading: (value: boolean) => dispatch({ type: 'SET_PHOTO_UPLOADING', payload: value }),
    setPhotoError: (error: string) => dispatch({ type: 'SET_PHOTO_ERROR', payload: error }),
    setCopySuccess: (value: boolean) => dispatch({ type: 'SET_COPY_SUCCESS', payload: value }),
    closeModal: () => dispatch({ type: 'CLOSE_MODAL' }),
    openProfileFieldModal: (config: Partial<ProfileState['modalConfig']>) => {
      dispatch({ type: 'SET_MODAL_CONFIG', payload: config });
      dispatch({ type: 'SET_CURRENT_MODAL', payload: ModalType.PROFILE_FIELD });
    },
    openSocialProfilesModal: () => dispatch({ type: 'SET_CURRENT_MODAL', payload: ModalType.SOCIAL_PROFILES }),
    openPasswordModal: () => dispatch({ type: 'SET_CURRENT_MODAL', payload: ModalType.PASSWORD }),
  };
}
