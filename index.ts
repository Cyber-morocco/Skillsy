import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);

export { default as LoginScreen } from './mobile/src/screens/LoginScreen';
export { default as SignupScreen } from './mobile/src/screens/SignupScreen';
export { default as ChatScreen } from './mobile/src/screens/ChatScreen';
export { default as ConversationScreen } from './mobile/src/screens/ConversationScreen';
