interface Window {
  gtag?: (
    command: 'config' | 'event' | 'js',
    targetOrAction: string | Date,
    params?: Record<string, unknown>
  ) => void;
}
