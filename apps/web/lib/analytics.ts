type GTagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

function trackEvent({ action, category, label, value }: GTagEvent) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
}

export const analytics = {
  chatMessageSent(model: string) {
    trackEvent({ action: 'chat_message_sent', category: 'chat', label: model });
  },
  chatModelChanged(model: string) {
    trackEvent({ action: 'chat_model_changed', category: 'chat', label: model });
  },
  toolToggled(toolId: string, enabled: boolean) {
    trackEvent({ action: 'tool_toggled', category: 'tools', label: `${toolId}:${enabled}` });
  },
  toolUsed(toolName: string) {
    trackEvent({ action: 'tool_used', category: 'tools', label: toolName });
  },
  navClicked(destination: string) {
    trackEvent({ action: 'nav_clicked', category: 'navigation', label: destination });
  },
  buttonClicked(buttonName: string) {
    trackEvent({ action: 'button_clicked', category: 'ui', label: buttonName });
  },
};
