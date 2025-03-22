// import 'expo-router/entry';
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import { useEffect } from 'react';
// https://docs.expo.dev/router/reference/troubleshooting/#expo_router_app_root-not-defined

// Must be exported or Fast Refresh won't update the context
export function App() {
  const ctx = require.context('./app');
  console.log("in root index.js")
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
