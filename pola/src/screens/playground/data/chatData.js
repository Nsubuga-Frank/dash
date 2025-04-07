// chatData.js
export const initialChatSessions = [
    {
      date: '2025-01-14',
      sessions: [
        {
          id: 'chat-1',
          name: 'React Component Help',
          messages: [
            { type: 'system', content: 'System message for chat 1' },
            { type: 'user', content: 'How do I create a reusable button component in React?' },
            { type: 'assistant', content: 'I can help you create a flexible button component. Here\'s a basic structure...' },
            { type: 'user', content: 'Can you add hover states?' },
            { type: 'assistant', content: 'Yes, we can add hover states using Tailwind classes. Here\'s how...' },
            { type: 'user', content: 'Thanks! One more question about animations' },
            { type: 'assistant', content: 'For animations, you can use Tailwind\'s transition classes like this...' },
          ],
        },
        {
          id: 'chat-2',
          name: 'Data Visualization Project',
          messages: [
            { type: 'system', content: 'System message for chat 2' },
            { type: 'user', content: 'I need to create a dashboard with charts' },
            { type: 'assistant', content: 'Let\'s use Recharts library for this. First, let\'s set up the basic structure...' },
            { type: 'user', content: 'Can we add filtering options?' },
            { type: 'assistant', content: 'Here\'s how we can implement data filtering...' },
          ],
        },
        {
          id: 'chat-3',
          name: 'API Integration Help',
          messages: [
            { type: 'system', content: 'System message for chat 3' },
            { type: 'user', content: 'How do I handle API errors properly?' },
            { type: 'assistant', content: 'Let\'s implement a robust error handling system...' },
            { type: 'user', content: 'What about rate limiting?' },
            { type: 'assistant', content: 'We can implement a throttling mechanism like this...' },
          ],
        }
      ],
    },
    {
      date: '2025-01-13',
      sessions: [
        {
          id: 'chat-4',
          name: 'State Management Discussion',
          messages: [
            { type: 'system', content: 'System message for chat 4' },
            { type: 'user', content: 'Should I use Redux or Context API?' },
            { type: 'assistant', content: 'Let\'s compare both options...' },
            { type: 'user', content: 'What about performance implications?' },
            { type: 'assistant', content: 'Here\'s a detailed breakdown of performance considerations...' },
            { type: 'user', content: 'Can you show an example with Context?' },
            { type: 'assistant', content: 'Here\'s a practical example using Context API...' },
          ],
        },
        {
          id: 'chat-5',
          name: 'Testing Strategies',
          messages: [
            { type: 'system', content: 'System message for chat 5' },
            { type: 'user', content: 'How to write good unit tests?' },
            { type: 'assistant', content: 'Let\'s go through testing best practices...' },
            { type: 'user', content: 'What about mocking APIs?' },
            { type: 'assistant', content: 'Here\'s how to effectively mock API calls...' },
          ],
        }
      ],
    },
    {
      date: '2025-01-12',
      sessions: [
        {
          id: 'chat-6',
          name: 'Performance Optimization',
          messages: [
            { type: 'system', content: 'System message for chat 6' },
            { type: 'user', content: 'My React app is slow, how can I optimize it?' },
            { type: 'assistant', content: 'Let\'s analyze common performance bottlenecks...' },
            { type: 'user', content: 'What about code splitting?' },
            { type: 'assistant', content: 'Here\'s how to implement effective code splitting...' },
            { type: 'user', content: 'And lazy loading?' },
            { type: 'assistant', content: 'Let me show you how to implement lazy loading...' },
          ],
        },
        {
          id: 'chat-7',
          name: 'CSS Architecture',
          messages: [
            { type: 'system', content: 'System message for chat 7' },
            { type: 'user', content: 'How should I structure my CSS?' },
            { type: 'assistant', content: 'Let\'s discuss CSS organization patterns...' },
            { type: 'user', content: 'What about CSS modules?' },
            { type: 'assistant', content: 'Here\'s how to effectively use CSS modules...' },
          ],
        }
      ],
    },
    {
      date: '2025-01-11',
      sessions: [
        {
          id: 'chat-8',
          name: 'Authentication Implementation',
          messages: [
            { type: 'system', content: 'System message for chat 8' },
            { type: 'user', content: 'How do I implement JWT authentication?' },
            { type: 'assistant', content: 'Let\'s create a secure authentication system...' },
            { type: 'user', content: 'What about refresh tokens?' },
            { type: 'assistant', content: 'Here\'s how to handle refresh tokens...' },
            { type: 'user', content: 'And logout functionality?' },
            { type: 'assistant', content: 'Let\'s implement a secure logout process...' },
          ],
        },
        {
          id: 'chat-9',
          name: 'Form Validation',
          messages: [
            { type: 'system', content: 'System message for chat 9' },
            { type: 'user', content: 'Best way to handle form validation?' },
            { type: 'assistant', content: 'Let\'s implement robust form validation...' },
            { type: 'user', content: 'What about async validation?' },
            { type: 'assistant', content: 'Here\'s how to handle async validation...' },
          ],
        }
      ],
    }
  ];
  
  export const initialCurrentSession = {
    id: 'chat-current',
    name: 'New Chat',
    messages: [
      { type: 'system', content: 'Welcome to the new chat!' },
      { type: 'assistant', content: 'Hi there! How can I help you with your development questions?' },
    ],
  };
  
  export const createNewSession = () => ({
    id: `chat-${Date.now()}`,
    name: 'New Chat',
    messages: [
      { type: 'system', content: 'Starting a brand new chat...' },
    ],
  });