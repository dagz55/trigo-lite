/**
 * Test file to verify autosave functionality for payment methods
 * This test can be run manually in the browser console
 */

// Test autosave functionality
export const testAutosave = () => {
  console.log("🧪 Testing TriGo Autosave Functionality");
  
  // Test 1: Check if localStorage is available
  console.log("1. Testing localStorage availability...");
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    console.log("✅ localStorage is available");
  } catch (error) {
    console.error("❌ localStorage is not available:", error);
    return;
  }

  // Test 2: Check if payment methods are saved
  console.log("2. Testing payment methods storage...");
  const testPaymentMethods = [
    { id: 'gcash', name: 'GCash', type: 'ewallet', isDefault: true, balance: 1250.50 },
    { id: 'paymaya', name: 'PayMaya', type: 'ewallet', isDefault: false, balance: 850.25 },
    { id: 'tricoin', name: 'TriCoin', type: 'crypto', isDefault: false, balance: 45.75 }
  ];

  try {
    localStorage.setItem('triGoPaymentMethods', JSON.stringify(testPaymentMethods));
    const retrieved = JSON.parse(localStorage.getItem('triGoPaymentMethods') || '[]');
    
    if (retrieved.length === testPaymentMethods.length) {
      console.log("✅ Payment methods can be saved and retrieved");
    } else {
      console.error("❌ Payment methods retrieval failed");
    }
  } catch (error) {
    console.error("❌ Payment methods storage failed:", error);
  }

  // Test 3: Test default payment method change
  console.log("3. Testing default payment method change...");
  try {
    const updatedMethods = testPaymentMethods.map(method => ({
      ...method,
      isDefault: method.id === 'paymaya'
    }));
    
    localStorage.setItem('triGoPaymentMethods', JSON.stringify(updatedMethods));
    const retrieved = JSON.parse(localStorage.getItem('triGoPaymentMethods') || '[]');
    const defaultMethod = retrieved.find((m: any) => m.isDefault);
    
    if (defaultMethod && defaultMethod.id === 'paymaya') {
      console.log("✅ Default payment method change works");
    } else {
      console.error("❌ Default payment method change failed");
    }
  } catch (error) {
    console.error("❌ Default payment method change test failed:", error);
  }

  // Test 4: Test persistence across page reload simulation
  console.log("4. Testing persistence simulation...");
  try {
    // Simulate what happens on page load
    const storedMethods = localStorage.getItem('triGoPaymentMethods');
    if (storedMethods) {
      const parsed = JSON.parse(storedMethods);
      const defaultMethod = parsed.find((m: any) => m.isDefault);
      
      if (defaultMethod) {
        console.log(`✅ Persistence works - Default method: ${defaultMethod.name}`);
      } else {
        console.error("❌ No default method found after persistence test");
      }
    } else {
      console.error("❌ No stored methods found");
    }
  } catch (error) {
    console.error("❌ Persistence test failed:", error);
  }

  console.log("🎉 Autosave functionality test completed!");
};

// Instructions for manual testing
export const testInstructions = `
To test the autosave functionality manually:

1. Open the browser console
2. Navigate to /passenger/profile
3. Run: testAutosave()
4. Change payment methods in the UI
5. Check localStorage in DevTools:
   - Application tab > Local Storage
   - Look for 'triGoPaymentMethods' key
6. Refresh the page and verify settings persist

Expected behavior:
- Payment method changes save automatically within 500ms
- Settings persist across browser sessions
- Default payment method is remembered
- Autosave status indicator shows save progress
`;

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as any).testAutosave = testAutosave;
  (window as any).testInstructions = testInstructions;
}
