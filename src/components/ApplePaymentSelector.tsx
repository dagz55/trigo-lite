"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { getPaymentIcon } from "@/lib/paymentUtils";
import type { PaymentMethod } from "@/types";

interface ApplePaymentSelectorProps {
  paymentMethods: PaymentMethod[];
  selectedMethod: PaymentMethod | null;
  onSelect: (methodId: string) => void;
  className?: string;
}

export const ApplePaymentSelector: React.FC<ApplePaymentSelectorProps> = ({
  paymentMethods,
  selectedMethod,
  onSelect,
  className = ""
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsAnimating(true);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsOpen(false), 200); // Match animation duration
  };

  const handleSelect = (methodId: string) => {
    onSelect(methodId);
    handleClose();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={isOpen ? handleClose : handleOpen}
        className={`
          w-full flex items-center justify-between p-4 
          bg-white border border-gray-200 rounded-2xl
          hover:border-gray-300 hover:shadow-sm
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
          transition-all duration-200 ease-out
          ${isOpen ? 'border-purple-500 shadow-lg' : ''}
        `}
      >
        <div className="flex items-center space-x-3">
          {selectedMethod ? (
            <>
              <div className="w-8 h-8 flex items-center justify-center">
                {getPaymentIcon(selectedMethod)}
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">{selectedMethod.name}</div>
                <div className="text-sm text-gray-500">
                  Balance: ₱{selectedMethod.balance?.toFixed(2) || '0.00'}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-sm">?</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-500">Select Payment Method</div>
                <div className="text-sm text-gray-400">Choose your preferred method</div>
              </div>
            </>
          )}
        </div>
        
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className={`
            absolute top-full left-0 right-0 mt-2 z-50
            bg-white border border-gray-200 rounded-2xl shadow-2xl
            overflow-hidden backdrop-blur-xl
            transform transition-all duration-200 ease-out origin-top
            ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          `}
        >
          <div className="py-2">
            {paymentMethods.map((method, index) => (
              <button
                key={method.id}
                type="button"
                onClick={() => handleSelect(method.id)}
                className={`
                  w-full flex items-center justify-between px-4 py-3
                  hover:bg-gray-50 active:bg-gray-100
                  transition-colors duration-150 ease-out
                  ${index === 0 ? 'rounded-t-xl' : ''}
                  ${index === paymentMethods.length - 1 ? 'rounded-b-xl' : ''}
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    {getPaymentIcon(method)}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{method.name}</div>
                    <div className="text-sm text-gray-500">
                      Balance: ₱{method.balance?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {method.isDefault && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                      Default
                    </span>
                  )}
                  {selectedMethod?.id === method.id && (
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          {/* Add Payment Method Option */}
          <div className="border-t border-gray-100">
            <button
              type="button"
              className="w-full flex items-center justify-center px-4 py-3 text-purple-600 hover:bg-purple-50 transition-colors duration-150"
              onClick={() => {
                handleClose();
                // TODO: Implement add payment method functionality
                console.log("Add payment method clicked");
              }}
            >
              <span className="font-medium">+ Add Payment Method</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplePaymentSelector;
