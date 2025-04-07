import emailjs from '@emailjs/browser';
import { AlertCircle, CheckCircle2, Mail, Send, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

const FeedbackModal = ({ isOpen, onClose, darkMode }) => {
  // Form states
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    setIsShowing(isOpen);
  }, [isOpen]);

  const resetForm = () => {
    setName('');
    setSubject('');
    setMessage('');
    setEmail('');
    setErrors({});
    setIsSubmitted(false);
    setSubmissionData(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    setIsShowing(false);
    setTimeout(() => {
      resetForm();
      onClose();
    }, 300);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Configure with your EmailJS service, template and user ID
      const templateParams = {
        from_name: name,
        from_email: email,
        subject: subject,
        message: message
      };
      
      // Replace these with your actual EmailJS service, template and user IDs
      await emailjs.send(
        'YOUR_SERVICE_ID',
        'YOUR_TEMPLATE_ID',
        templateParams,
        'YOUR_PUBLIC_KEY'
      );
      
      const summaryData = {
        name: name || 'Not provided',
      email: email || 'Not provided',
        subject: subject || 'Not provided',
        message: message || 'Not provided',
        timestamp: new Date().toLocaleString(),
        messageIntro: 'Thank you for contacting our support team!'
      };
      
      setSubmissionData(summaryData);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error sending email:", error);
      setErrors({
        submit: "Failed to send your message. Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Please enter your name';
    }
    
    if (!subject.trim()) {
      newErrors.subject = 'Please enter a subject';
    }
    
    if (!message.trim()) {
      newErrors.message = 'Please enter your message';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className={`
          absolute inset-0 bg-black/30 backdrop-blur-sm
          transition-opacity duration-300 ease-out
          ${isShowing ? 'opacity-100' : 'opacity-0'}
        `} 
        onClick={handleClose} 
      />
      
      <div 
        className={`
          absolute top-0 right-0 bottom-0
          w-full sm:w-96 
          ${darkMode 
            ? 'bg-gray-800 text-white/90' 
            : 'bg-white text-gray-800'}
          shadow-xl
          transition-all duration-300 ease-in-out transform
          ${isShowing ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <h2 className="font-semibold">Contact Support Team</h2>
            </div>
            <button
              onClick={handleClose}
              className={`
                p-1 rounded-full
                transition-colors duration-200
                ${darkMode 
                  ? 'hover:bg-white/10 text-white/70 hover:text-white/90' 
                  : 'hover:bg-black/5 text-gray-400 hover:text-gray-600'}
              `}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-auto">
              {isSubmitted && submissionData ? (
            <div className="p-4 space-y-4">
                  <div className="flex justify-center">
                    <div className={`rounded-full p-2 ${darkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                      <CheckCircle2 size={20} className={darkMode ? 'text-green-400' : 'text-green-600'} />
                    </div>
                  </div>

                  <div className="text-center">
                <h3 className="text-lg font-semibold">Message Sent!</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {submissionData.messageIntro}
                    </p>
                  </div>

                  <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h4 className="font-medium mb-2 text-sm">Request Summary</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Name</span>
                    <p className="font-medium">{submissionData.name}</p>
                  </div>
                  <div>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Subject</span>
                    <p className="font-medium">{submissionData.subject}</p>
                      </div>
                        <div>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Message</span>
                    <p className="font-medium">{submissionData.message}</p>
                        </div>
                        <div>
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Email</span>
                          <p className="font-medium break-all">{submissionData.email}</p>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-600/20">
                      Submitted on {submissionData.timestamp}
                    </div>
                  </div>
                </div>
              ) : (
            <div className="p-4 space-y-4">
              {errors.submit && (
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-100 text-red-600'} text-sm`}>
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{errors.submit}</span>
                  </div>
                </div>
              )}
              
              <div>
                <p className="mb-2 text-sm font-medium">Your Name *</p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                    className={`
                    w-full p-3 rounded-lg
                    transition-colors duration-200
                      ${darkMode 
                      ? 'bg-gray-700/50 focus:bg-gray-700 border-gray-600' 
                      : 'bg-gray-50 focus:bg-white border-gray-200'}
                    border focus:outline-none focus:ring-2 focus:ring-blue-500/50
                    placeholder:opacity-50 text-sm
                    ${errors.name ? 'border-red-400' : ''}
                  `}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.name}
                  </p>
                )}
              </div>

                  <div>
                <p className="mb-2 text-sm font-medium">Subject *</p>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject"
                          className={`
                    w-full p-3 rounded-lg
                    transition-colors duration-200
                    ${darkMode 
                      ? 'bg-gray-700/50 focus:bg-gray-700 border-gray-600' 
                      : 'bg-gray-50 focus:bg-white border-gray-200'}
                    border focus:outline-none focus:ring-2 focus:ring-blue-500/50
                    placeholder:opacity-50 text-sm
                    ${errors.subject ? 'border-red-400' : ''}
                  `}
                />
                {errors.subject && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                    {errors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                <p className="mb-2 text-sm font-medium">Message *</p>
                    <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What can we help you with?"
                      className={`
                    w-full p-3 rounded-lg resize-none h-32
                        transition-colors duration-200
                    ${darkMode 
                            ? 'bg-gray-700/50 focus:bg-gray-700 border-gray-600'
                      : 'bg-gray-50 focus:bg-white border-gray-200'}
                        border focus:outline-none focus:ring-2 focus:ring-blue-500/50
                        placeholder:opacity-50 text-sm
                    ${errors.message ? 'border-red-400' : ''}
                  `}
                />
                {errors.message && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.message}
                  </p>
                )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Your Email *</p>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    For our response
                      </span>
                    </div>
                    
                    <div className="relative">
                      <Mail size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className={`
                          w-full pl-9 pr-3 py-2 rounded-lg
                          transition-colors duration-200
                          ${darkMode 
                            ? 'bg-gray-700/50 focus:bg-gray-700 border-gray-600' 
                            : 'bg-gray-50 focus:bg-white border-gray-200'}
                          border focus:outline-none focus:ring-2 focus:ring-blue-500/50
                          placeholder:opacity-50 text-sm
                          ${errors.email ? 'border-red-400' : ''}
                        `}
                      />
                      
                      {errors.email && (
                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isSubmitted && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`
                w-full py-2 rounded-lg font-medium
                transition-all duration-200
                flex items-center justify-center gap-2
                bg-blue-500 hover:bg-blue-400 text-white text-sm
                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Message</span>
              <Send size={14} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

FeedbackModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  darkMode: PropTypes.bool
};

export default FeedbackModal;
