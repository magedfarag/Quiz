interface AccessibilityState {
  highContrast: boolean;
  fontSize: number;
  screenReader: boolean;
}

export const AccessibilityContext = createContext<{
  state: AccessibilityState;
  toggleHighContrast: () => void;
  increaseFontSize: () => void;
  // ... other actions
}>(null);

export function AccessibilityProvider({ children }) {
  const [state, setState] = useState<AccessibilityState>({
    highContrast: false,
    fontSize: 16,
    screenReader: false
  });

  useEffect(() => {
    // Apply CSS variables based on state
    document.documentElement.style.setProperty(
      '--font-size', `${state.fontSize}px`
    );
  }, [state]);

  return (
    <AccessibilityContext.Provider value={{
      state,
      toggleHighContrast: () => setState(s => ({
        ...s, highContrast: !s.highContrast 
      })),
      // ... other actions
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}
