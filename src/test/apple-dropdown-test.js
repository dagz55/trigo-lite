/**
 * Apple-like Dropdown and Autosave Functionality Test
 * Run this in the browser console on the /passenger/profile page
 */

// Test the Apple-like dropdown functionality
const testAppleDropdown = () => {
  console.log("🍎 Testing Apple-like Payment Dropdown Functionality");
  
  // Test 1: Check if dropdown trigger exists
  console.log("1. Testing dropdown trigger button...");
  const dropdownTrigger = document.querySelector('[class*="rounded-2xl"][class*="border"]');
  if (dropdownTrigger) {
    console.log("✅ Dropdown trigger button found");
    
    // Test click functionality
    console.log("2. Testing dropdown click functionality...");
    dropdownTrigger.click();
    
    setTimeout(() => {
      const dropdown = document.querySelector('[class*="absolute"][class*="z-50"]');
      if (dropdown) {
        console.log("✅ Dropdown menu opens successfully");
        
        // Test payment method options
        const paymentOptions = dropdown.querySelectorAll('button[type="button"]');
        console.log(`✅ Found ${paymentOptions.length} payment options`);
        
        // Test selecting a payment method
        if (paymentOptions.length > 1) {
          console.log("3. Testing payment method selection...");
          paymentOptions[1].click(); // Click second option
          
          setTimeout(() => {
            const closedDropdown = document.querySelector('[class*="absolute"][class*="z-50"]');
            if (!closedDropdown) {
              console.log("✅ Dropdown closes after selection");
            } else {
              console.log("❌ Dropdown should close after selection");
            }
          }, 100);
        }
      } else {
        console.log("❌ Dropdown menu does not open");
      }
    }, 100);
  } else {
    console.log("❌ Dropdown trigger button not found");
  }
};

// Test autosave status indicator
const testAutosaveStatus = () => {
  console.log("💾 Testing Autosave Status Indicator");
  
  // Check if autosave status component exists
  const autosaveStatus = document.querySelector('[class*="bg-gray-50"][class*="rounded-lg"]');
  if (autosaveStatus) {
    console.log("✅ Autosave status component found");
    
    // Check for status indicators
    const statusIcon = autosaveStatus.querySelector('[class*="w-4"][class*="h-4"]');
    const statusText = autosaveStatus.querySelector('[class*="text-sm"]');
    const saveButton = autosaveStatus.querySelector('button');
    
    if (statusIcon) console.log("✅ Status icon found");
    if (statusText) console.log(`✅ Status text found: "${statusText.textContent}"`);
    if (saveButton) {
      console.log("✅ Manual save button found");
      
      // Test manual save button
      console.log("Testing manual save button...");
      saveButton.click();
      console.log("✅ Manual save button clicked");
    }
  } else {
    console.log("❌ Autosave status component not found");
  }
};

// Test localStorage persistence
const testLocalStoragePersistence = () => {
  console.log("🗄️ Testing localStorage Persistence");
  
  // Check if payment methods are stored
  const storedMethods = localStorage.getItem('triGoPaymentMethods');
  if (storedMethods) {
    try {
      const parsed = JSON.parse(storedMethods);
      console.log("✅ Payment methods found in localStorage");
      console.log(`📊 Found ${parsed.length} payment methods`);
      
      const defaultMethod = parsed.find(m => m.isDefault);
      if (defaultMethod) {
        console.log(`✅ Default payment method: ${defaultMethod.name}`);
      } else {
        console.log("❌ No default payment method found");
      }
    } catch (error) {
      console.log("❌ Error parsing stored payment methods:", error);
    }
  } else {
    console.log("❌ No payment methods found in localStorage");
  }
};

// Test Apple-like design elements
const testAppleDesign = () => {
  console.log("🎨 Testing Apple-like Design Elements");
  
  const checks = [
    {
      name: "Rounded corners (rounded-2xl)",
      selector: '[class*="rounded-2xl"]',
    },
    {
      name: "Smooth transitions",
      selector: '[class*="transition"]',
    },
    {
      name: "Hover effects",
      selector: '[class*="hover:"]',
    },
    {
      name: "Focus rings",
      selector: '[class*="focus:ring"]',
    },
    {
      name: "Shadow effects",
      selector: '[class*="shadow"]',
    },
    {
      name: "Backdrop blur",
      selector: '[class*="backdrop-blur"]',
    }
  ];
  
  checks.forEach(check => {
    const elements = document.querySelectorAll(check.selector);
    if (elements.length > 0) {
      console.log(`✅ ${check.name}: ${elements.length} elements found`);
    } else {
      console.log(`❌ ${check.name}: No elements found`);
    }
  });
};

// Test responsive behavior
const testResponsiveBehavior = () => {
  console.log("📱 Testing Responsive Behavior");
  
  const dropdown = document.querySelector('[class*="w-full"]');
  if (dropdown) {
    const rect = dropdown.getBoundingClientRect();
    console.log(`✅ Dropdown width: ${rect.width}px`);
    
    if (rect.width > 200) {
      console.log("✅ Dropdown has appropriate width");
    } else {
      console.log("❌ Dropdown might be too narrow");
    }
  }
};

// Comprehensive test suite
const runAllTests = () => {
  console.log("🧪 Running Comprehensive Apple Dropdown & Autosave Tests");
  console.log("=" * 60);
  
  testAppleDropdown();
  
  setTimeout(() => {
    testAutosaveStatus();
    testLocalStoragePersistence();
    testAppleDesign();
    testResponsiveBehavior();
    
    console.log("=" * 60);
    console.log("🎉 All tests completed!");
    console.log("Check the console output above for detailed results.");
  }, 1000);
};

// Performance test
const testPerformance = () => {
  console.log("⚡ Testing Performance");
  
  const startTime = performance.now();
  
  // Simulate multiple dropdown interactions
  const trigger = document.querySelector('[class*="rounded-2xl"][class*="border"]');
  if (trigger) {
    for (let i = 0; i < 10; i++) {
      trigger.click();
      setTimeout(() => trigger.click(), 10);
    }
    
    const endTime = performance.now();
    console.log(`✅ 10 dropdown interactions completed in ${(endTime - startTime).toFixed(2)}ms`);
  }
};

// Export functions for browser console
if (typeof window !== 'undefined') {
  window.testAppleDropdown = testAppleDropdown;
  window.testAutosaveStatus = testAutosaveStatus;
  window.testLocalStoragePersistence = testLocalStoragePersistence;
  window.testAppleDesign = testAppleDesign;
  window.testResponsiveBehavior = testResponsiveBehavior;
  window.runAllTests = runAllTests;
  window.testPerformance = testPerformance;
  
  console.log("🔧 Test functions loaded! Available commands:");
  console.log("- runAllTests() - Run all tests");
  console.log("- testAppleDropdown() - Test dropdown functionality");
  console.log("- testAutosaveStatus() - Test autosave indicator");
  console.log("- testLocalStoragePersistence() - Test data persistence");
  console.log("- testAppleDesign() - Test design elements");
  console.log("- testResponsiveBehavior() - Test responsive design");
  console.log("- testPerformance() - Test performance");
}
