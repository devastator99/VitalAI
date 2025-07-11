import { fetchTogetherResponse, fetchTogetherStreamingResponse } from './OpenaiApi';

// Test non-streaming response
async function testNonStreaming() {
  console.log('Testing non-streaming response...');
  const messages = [
    { isAi: false, content: 'Hello, how are you?' }
  ];
  
  const result = await fetchTogetherResponse(messages);
  
  if (result.success) {
    console.log('✅ Success! Response:', result.data);
  } else {
    console.error('❌ Error:', result.error);
  }
}

// Test streaming response
async function testStreaming() {
  console.log('\nTesting streaming response...');
  const messages = [
    { isAi: false, content: 'Tell me a short story about a robot' }
  ];
  
  let accumulated = '';
  
  await fetchTogetherStreamingResponse(
    messages,
    (text) => {
      accumulated = text;
      console.log('Received text delta:', text);
    },
    () => console.log('Stream started'),
    () => console.log('✅ Stream completed successfully'),
    (error) => console.error('❌ Stream error:', error)
  );
  
  console.log('Final accumulated text:', accumulated);
}

// Run tests
(async () => {
  await testNonStreaming();
  await testStreaming();
})();
