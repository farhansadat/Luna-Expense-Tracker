import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faArrowRight, faChartLine, faCalculator, faPiggyBank, faLightbulb, faPaperPlane, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useUserSettingsStore } from '../store/userSettingsStore';
import { useExpenseStore } from '../store/expenseStore';
import { useAccountStore } from '../store/accountStore';
import { formatCurrency } from '../lib/currency';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export default function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const { name, currency } = useUserSettingsStore();
  const { expenses, getExpensesByCategory } = useExpenseStore();
  const { accounts, scheduledPayments } = useAccountStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Luna, your personal finance AI assistant. I can help you with any questions about your finances, budgeting, or how to use FinWise. What can I help you with today?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // TODO: Implement actual AI response logic
      // For now, we'll simulate a response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I understand you're asking about " + input + ". Let me help you with that...",
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsTyping(false);
    }
  };

  const generateResponse = (userInput: string): string => {
    // Calculate financial metrics
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const monthlyExpenses = expenses
      .filter(exp => new Date(exp.date).getMonth() === new Date().getMonth())
      .reduce((sum, exp) => sum + exp.amount, 0);
    const categoryExpenses = getExpensesByCategory();
    const upcomingPayments = scheduledPayments
      .filter(payment => payment.status === 'active')
      .slice(0, 3);

    // Check for keywords in user input
    if (userInput.includes('expense') || userInput.includes('spending')) {
      const topCategories = Object.entries(categoryExpenses)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);
      
      return `Based on your spending analysis:

1. Total expenses this month: ${formatCurrency(monthlyExpenses, currency)}
2. Top spending categories:
   ${topCategories.map(([cat, amount]) => `• ${cat}: ${formatCurrency(amount, currency)}`).join('\n   ')}

💡 Tip: Consider setting budget limits for your top spending categories to better manage expenses.`;
    }

    if (userInput.includes('balance') || userInput.includes('accounts')) {
      const accountSummary = accounts
        .map(acc => `• ${acc.name}: ${formatCurrency(acc.balance, currency)}`)
        .join('\n   ');
      
      return `Your current financial snapshot:

1. Total Balance: ${formatCurrency(totalBalance, currency)}
2. Account Breakdown:
   ${accountSummary}

💡 Tip: Consider diversifying your accounts to optimize returns and minimize risks.`;
    }

    if (userInput.includes('bill') || userInput.includes('payment')) {
      const paymentsList = upcomingPayments
        .map(payment => `• ${payment.description}: ${formatCurrency(payment.amount, currency)} (${payment.next_date})`)
        .join('\n   ');
      
      return `Upcoming scheduled payments:

${paymentsList || 'No upcoming payments scheduled.'}

💡 Tip: Setting up automatic payments can help you avoid late fees and maintain a good credit score.`;
    }

    if (userInput.includes('save') || userInput.includes('saving')) {
      return `Here are some personalized savings strategies:

1. 50/30/20 Rule:
   • 50% for needs (${formatCurrency(totalBalance * 0.5, currency)})
   • 30% for wants (${formatCurrency(totalBalance * 0.3, currency)})
   • 20% for savings (${formatCurrency(totalBalance * 0.2, currency)})

2. Quick Wins:
   • Review and cancel unused subscriptions
   • Set up automatic savings transfers
   • Look for cashback opportunities

3. Long-term Strategies:
   • Start an emergency fund
   • Consider high-yield savings accounts
   • Explore investment options

Would you like me to help you set up a savings plan?`;
    }

    if (userInput.includes('invest') || userInput.includes('investment')) {
      return `Investment Insights:

1. Investment Options:
   • Stock Market: ETFs, Index Funds
   • Real Estate: REITs, Property
   • Bonds: Government, Corporate
   • Retirement: 401(k), IRA

2. Risk Management:
   • Diversify across asset classes
   • Regular portfolio rebalancing
   • Dollar-cost averaging

3. Market Trends:
   • Monitor interest rates
   • Track market indicators
   • Stay informed about economic news

Would you like specific investment recommendations based on your risk profile?`;
    }

    return `I can help you with:

1. Financial Analysis
   • Expense tracking
   • Budget planning
   • Spending patterns

2. Wealth Management
   • Investment strategies
   • Savings optimization
   • Risk assessment

3. Daily Operations
   • Bill payments
   • Account management
   • Transaction monitoring

What specific aspect would you like to explore?`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faRobot} className="w-6 h-6 text-accent-primary" />
            <h2 className="text-xl font-semibold text-white">Luna - AI Assistant</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-accent-primary text-white'
                    : 'bg-dark-700 text-gray-200'
                }`}
              >
                <p>{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-dark-700 text-gray-200 rounded-lg p-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-dark-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about your finances..."
              className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 