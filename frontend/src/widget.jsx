import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './components/ChatWidget/ChatWidget';

// Configuration from global scope
const config = window.LiveChatConfig || {
  apiUrl: 'https://depauperate-destiny-superdelicate.ngrok-free.dev/api/v1',
  socketUrl: 'https://depauperate-destiny-superdelicate.ngrok-free.dev'
};

// Create widget container
const createWidgetContainer = () => {
  const container = document.createElement('div');
  container.id = 'live-chat-widget-root';
  document.body.appendChild(container);
  return container;
};

// Initialize widget
const initWidget = () => {
  const container = createWidgetContainer();
  const root = ReactDOM.createRoot(container);

  root.render(
    <React.StrictMode>
      <ChatWidget
        apiUrl={config.apiUrl}
        socketUrl={config.socketUrl}
      />
    </React.StrictMode>
  );
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWidget);
} else {
  initWidget();
}

// Export for manual initialization
window.LiveChatWidget = {
  init: initWidget,
  config: config
};
