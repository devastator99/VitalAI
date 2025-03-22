// import React, { useRef } from 'react';
// // import { WebView, WebViewNavigation } from 'react-native-webview';
// import { Modal, View, StyleSheet } from 'react-native';

// interface RazorpayWebViewProps {
//   visible: boolean;
//   onClose: (success: boolean, paymentData?: { paymentId: string; orderId: string; signature: string }) => void;
//   orderDetails: {
//     checkoutPage: string;
//   };
// }

// const RazorpayWebView = ({ visible, onClose, orderDetails }: RazorpayWebViewProps) => {
//   const webViewRef = useRef<WebView>(null);

//   const handleNavigationStateChange = (navState: WebViewNavigation) => {
//     // Add back basic URL check for payment cancellation
//     if (navState.url.includes('cancel')) {
//       onClose(false);
//     }
//   };

//   const handleMessage = (event: any) => {
//     const data = JSON.parse(event.nativeEvent.data);
//     if (data.status === 'success') {
//       // Pass all verification data to parent
//       onClose(true, {
//         paymentId: data.paymentId,
//         orderId: data.orderId,
//         signature: data.signature
//       });
//     } else {
//       onClose(false);
//     }
//   };

//   return (
//     <Modal 
//       visible={visible} 
//       animationType="slide"
//       onRequestClose={() => onClose(false)}  // Add Android back button handling
//     >
//       <View style={styles.container}>
//         <WebView
//           ref={webViewRef}
//           source={{ uri: orderDetails.checkoutPage }}  // Changed from html to uri
//           onMessage={handleMessage}
//           onNavigationStateChange={handleNavigationStateChange}  // Re-enable navigation changes
//           javaScriptEnabled={true}
//           domStorageEnabled={true}
//           startInLoadingState={true}
//           mixedContentMode="compatibility"  // Add for HTTPS compatibility
//         />
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     marginTop: 40,
//   },
// });

// export default RazorpayWebView;