# Polaris Dashboard - Model Playground Architecture

This document provides a detailed architecture overview of the Model Playground component within the Polaris Dashboard system. The playground enables interactive communication with AI models, session management, model configuration, and deployment monitoring.

## Table of Contents

1. [Component Architecture](#component-architecture)
2. [Data Flow Patterns](#data-flow-patterns)
3. [Key Interaction Sequences](#key-interaction-sequences)
   - [Model Selection Flow](#model-selection-flow)
   - [Chat Session Management](#chat-session-management)
   - [Message Exchange Flow](#message-exchange-flow)
   - [Configuration Management](#configuration-management)
   - [History & Session Management](#history--session-management)
4. [Error Handling Patterns](#error-handling-patterns)
5. [Performance Considerations](#performance-considerations)

## Component Architecture

```mermaid
classDiagram
    class PlaygroundContainer {
        +state: chatSessions[]
        +state: currentSession
        +state: selectedModel
        +state: modelConfig
        +handleNewChat()
        +handleSendMessage()
        +handleModelSelect()
        +handleConfigChange()
    }
    
    class LeftSidebar {
        +props: chatSessions[]
        +props: onChatSelect()
        +props: onNewChat()
        +state: isExpanded
        +renderChatHistory()
        +renderActionButtons()
    }
    
    class ChatArea {
        +props: messages[]
        +props: onSendMessage()
        +props: isLoading
        +state: inputValue
        +state: showScrollButton
        +scrollToBottom()
        +handleSubmit()
        +renderMessages()
    }
    
    class ChatMessage {
        +props: message
        +props: isUser
        +props: darkMode
        +renderMarkdown()
        +renderCode()
        +renderImages()
    }
    
    class RightSidebar {
        +props: selectedModel
        +props: modelConfig
        +props: onConfigChange()
        +props: onModelSelect()
        +state: isExpanded
        +state: activeSection
        +renderModelSelection()
        +renderConfigControls()
    }
    
    class ModelDropdown {
        +props: models[]
        +props: selectedModel
        +props: onSelect()
        +state: isOpen
        +state: searchQuery
        +state: filterType
        +getFilteredModels()
        +handleModelSelect()
    }
    
    class ConfigurationPanel {
        +props: config
        +props: onChange()
        +state: expandedSections
        +renderTemperatureControl()
        +renderMaxTokensControl()
        +renderSystemPromptEditor()
    }
    
    class useChatApi {
        +state: isLoading
        +state: error
        +createNewChat()
        +loadChatHistory()
        +loadChatMessages()
        +sendMessage()
        +renameChat()
        +deleteChat()
    }
    
    PlaygroundContainer --> LeftSidebar
    PlaygroundContainer --> ChatArea
    PlaygroundContainer --> RightSidebar
    PlaygroundContainer --> useChatApi
    ChatArea --> ChatMessage
    RightSidebar --> ModelDropdown
    RightSidebar --> ConfigurationPanel
```

### Component Responsibilities

1. **PlaygroundContainer**: 
   - Root component managing overall state and orchestrating interactions
   - Maintains current chat session, model selection, and configuration

2. **LeftSidebar**:
   - Displays chat history and sessions
   - Provides navigation and chat session management

3. **ChatArea**:
   - Renders message history
   - Handles message input
   - Manages scrolling behavior

4. **ChatMessage**:
   - Renders individual messages with formatting
   - Supports markdown, code highlighting, and media

5. **RightSidebar**:
   - Houses model selection and configuration
   - May contain multiple panels/sections

6. **ModelDropdown**:
   - Handles model browsing and selection
   - Implements search and filtering

7. **ConfigurationPanel**:
   - Provides controls for model parameters
   - Manages system prompts and model settings

8. **useChatApi**:
   - Custom hook for interfacing with chat services
   - Handles data persistence and retrieval

## Data Flow Patterns

```mermaid
flowchart TD
    subgraph "Component State"
        CompState["Local Component State\n- UI States\n- Form Inputs\n- Expanded/Collapsed"]
    end
    
    subgraph "Container State"
        ContState["Container-Level State\n- Active Sessions\n- Selected Models\n- Configuration"]
    end
    
    subgraph "External State"
        FireState["Firebase\n- Persistent Chat History\n- User Preferences\n- API Keys"]
        CacheState["Local Cache\n- Recent Messages\n- Temporary Settings"]
    end
    
    User[User Interactions]
    ModelAPI[AI Model APIs]
    
    User --> CompState
    CompState --> ContState
    ContState --> FireState
    ContState --> ModelAPI
    ModelAPI --> ContState
    FireState --> ContState
    ContState --> CacheState
    CacheState --> ContState
    ContState --> CompState
    CompState --> User
```

## Key Interaction Sequences

### Model Selection Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Playground UI
    participant ModelDD as ModelDropdown
    participant API as API Service
    participant Firebase as Firestore
    
    User->>UI: Click "Select Model"
    UI->>ModelDD: openModelDropdown()
    
    ModelDD->>API: fetchAvailableModels()
    
    par Model Categories
        API->>Firebase: Query public models
        Firebase-->>API: Return public models
    and
        API->>Firebase: Query private models with access
        Firebase-->>API: Return private models
    end
    
    API-->>ModelDD: Combined model list
    
    User->>ModelDD: Enter search query
    ModelDD->>ModelDD: filterModels(query, type)
    ModelDD-->>UI: Update filtered models list
    
    User->>ModelDD: Select model
    ModelDD->>UI: onModelSelect(selectedModel)
    
    UI->>Firebase: Check API key availability
    Firebase-->>UI: Return API key status
    
    alt Missing API Key
        UI-->>User: Show API key input dialog
        User->>UI: Enter API key
        UI->>Firebase: Store API key for model
    end
    
    UI->>UI: Update selectedModel state
    UI->>UI: Adjust configuration defaults for model
    UI-->>User: Show selected model indicator
    
    UI->>Firebase: Log model selection (analytics)
```

### Chat Session Management

```mermaid
sequenceDiagram
    participant User
    participant SideNav as LeftSidebar
    participant ContComp as PlaygroundContainer
    participant ChatHook as useChatApi
    participant Firebase as Firestore
    
    alt Create New Chat
        User->>SideNav: Click "New Chat"
        SideNav->>ContComp: handleNewChat()
        ContComp->>ChatHook: createNewChat(defaultName)
        
        alt Selected Model Exists
            ChatHook->>Firebase: Create chat document
            Firebase-->>ChatHook: Return chat ID
            ChatHook-->>ContComp: Return new chat session
            ContComp->>ContComp: setCurrentSession(newSession)
            ContComp-->>SideNav: Update chat list
            ContComp-->>User: Focus message input
        else No Model Selected
            ContComp-->>User: Show model selection prompt
        end
    else Open Existing Chat
        User->>SideNav: Click on chat in history
        SideNav->>ContComp: handleSessionSelect(sessionId)
        ContComp->>ChatHook: loadChatMessages(sessionId)
        ChatHook->>Firebase: Get chat document
        ChatHook->>Firebase: Get chat messages
        Firebase-->>ChatHook: Return chat data
        ChatHook-->>ContComp: Return formatted chat
        ContComp->>ContComp: setCurrentSession(loadedSession)
        ContComp-->>User: Display chat history
    else Rename Chat
        User->>SideNav: Click rename icon
        SideNav->>User: Show rename input
        User->>SideNav: Enter new name
        SideNav->>ContComp: handleRenameChat(sessionId, newName)
        ContComp->>ChatHook: renameChat(sessionId, newName)
        ChatHook->>Firebase: Update chat document
        Firebase-->>ChatHook: Confirm update
        ChatHook-->>ContComp: Return success
        ContComp-->>SideNav: Update chat list with new name
    else Delete Chat
        User->>SideNav: Click delete icon
        SideNav->>User: Show confirmation dialog
        User->>SideNav: Confirm deletion
        SideNav->>ContComp: handleDeleteChat(sessionId)
        ContComp->>ChatHook: deleteChat(sessionId)
        ChatHook->>Firebase: Delete chat document
        ChatHook->>Firebase: Delete associated messages
        Firebase-->>ChatHook: Confirm deletion
        ChatHook-->>ContComp: Return success
        ContComp->>ContComp: If current chat deleted, select another or create new
        ContComp-->>SideNav: Update chat list
    end
```

### Message Exchange Flow

```mermaid
sequenceDiagram
    participant User
    participant ChatUI as ChatArea
    participant ContComp as PlaygroundContainer
    participant ChatHook as useChatApi
    participant Firebase as Firestore
    participant ModelAPI as Model API
    
    User->>ChatUI: Type message & press send
    ChatUI->>ContComp: handleSendMessage(message)
    
    Note over ContComp: Validate session and model
    
    alt Valid session exists
        ContComp->>ContComp: Optimistically add message to UI
        ContComp->>ChatHook: sendMessage(sessionId, message, modelConfig)
        
        alt First message in chat
            ChatHook->>Firebase: Ensure chat session exists
            Firebase-->>ChatHook: Confirm session
        end
        
        ChatHook->>Firebase: Save user message
        
        ChatHook->>ChatHook: Prepare request body based on model type
        
        alt GPT-2 Models
            ChatHook->>ChatHook: Format as text completion request
            ChatHook->>ModelAPI: POST /v1/completions
        else Chat Models
            ChatHook->>ChatHook: Format as chat completion request
            ChatHook->>ModelAPI: POST /v1/chat/completions
        end
        
        alt Streaming Enabled
            ModelAPI-->>ChatHook: Stream response tokens
            
            loop For each token
                ChatHook-->>ContComp: Partial response update
                ContComp-->>ChatUI: Update UI with partial response
                ChatUI-->>User: Show incremental response
            end
        else Non-Streaming
            ModelAPI-->>ChatHook: Complete response
            ChatHook-->>ContComp: Full response
            ContComp-->>ChatUI: Update UI with full response
        end
        
        ChatHook->>Firebase: Save assistant response
        Firebase-->>ChatHook: Confirm save
        
        ChatHook-->>ContComp: Signal completion
        ContComp-->>ChatUI: Enable input for next message
        ChatUI-->>User: Show completion indicators
    else No valid session
        ContComp-->>ChatUI: Show error
        ChatUI-->>User: Display error message
    end
    
    alt Error Occurs
        ModelAPI-->>ChatHook: Error response
        ChatHook-->>ContComp: Propagate error
        ContComp-->>ChatUI: Display error
        ChatUI-->>User: Show error message with retry option
        
        User->>ChatUI: Click retry
        ChatUI->>ContComp: handleRetry(originalMessage)
        ContComp->>ChatHook: sendMessage(sessionId, originalMessage, modelConfig)
        Note over ContComp,ChatHook: Process repeats from this point
    end
```

### Configuration Management

```mermaid
sequenceDiagram
    participant User
    participant RightPnl as RightSidebar
    participant ConfigPnl as ConfigurationPanel
    participant ContComp as PlaygroundContainer
    participant ChatHook as useChatApi
    participant Firebase as Firestore
    
    User->>RightPnl: Open configuration panel
    RightPnl->>ConfigPnl: Render with current config
    
    alt Adjust Temperature
        User->>ConfigPnl: Move temperature slider
        ConfigPnl->>ConfigPnl: Update local state
        ConfigPnl->>RightPnl: onChange({temperature: newValue})
        RightPnl->>ContComp: handleConfigChange({temperature: newValue})
        ContComp->>ContComp: setModelConfig(updatedConfig)
    else Update Max Tokens
        User->>ConfigPnl: Change max tokens value
        ConfigPnl->>ConfigPnl: Validate input
        ConfigPnl->>RightPnl: onChange({maxTokens: newValue})
        RightPnl->>ContComp: handleConfigChange({maxTokens: newValue})
        ContComp->>ContComp: setModelConfig(updatedConfig)
    else Edit System Prompt
        User->>ConfigPnl: Edit system prompt
        ConfigPnl->>ConfigPnl: Update local state
        ConfigPnl->>RightPnl: onChange({systemPrompt: newValue})
        RightPnl->>ContComp: handleConfigChange({systemPrompt: newValue})
        ContComp->>ContComp: setModelConfig(updatedConfig)
    else Save Configuration Preset
        User->>ConfigPnl: Click "Save Preset"
        ConfigPnl->>User: Show preset name dialog
        User->>ConfigPnl: Enter preset name
        ConfigPnl->>RightPnl: onSavePreset(name, config)
        RightPnl->>ContComp: handleSavePreset(name, config)
        ContComp->>ChatHook: saveConfigPreset(name, config)
        ChatHook->>Firebase: Store in user presets collection
        Firebase-->>ChatHook: Confirm save
        ChatHook-->>ContComp: Return success
        ContComp-->>RightPnl: Update presets list
        RightPnl-->>ConfigPnl: Show success confirmation
    else Load Configuration Preset
        User->>ConfigPnl: Select preset from dropdown
        ConfigPnl->>RightPnl: onLoadPreset(presetId)
        RightPnl->>ContComp: handleLoadPreset(presetId)
        ContComp->>ChatHook: loadConfigPreset(presetId)
        ChatHook->>Firebase: Get preset document
        Firebase-->>ChatHook: Return preset config
        ChatHook-->>ContComp: Return preset data
        ContComp->>ContComp: setModelConfig(presetConfig)
        ContComp-->>RightPnl: Update with loaded config
        RightPnl-->>ConfigPnl: Update UI controls
        ConfigPnl-->>User: Show preset loaded confirmation
    end
    
    Note over ContComp: Config changes apply to next messages
```

### History & Session Management

```mermaid
sequenceDiagram
    participant User
    participant SideNav as LeftSidebar
    participant HistoryMdl as HistoryModal
    participant ContComp as PlaygroundContainer
    participant ChatHook as useChatApi
    participant Firebase as Firestore
    
    User->>SideNav: Click "Chat History"
    SideNav->>ContComp: openHistoryModal()
    ContComp->>HistoryMdl: show(true)
    
    HistoryMdl->>ChatHook: loadChatHistory()
    ChatHook->>Firebase: Query chats collection
    Note over ChatHook,Firebase: Filter by userId, sort by date
    
    Firebase-->>ChatHook: Return chats data
    
    ChatHook->>ChatHook: Group chats by date
    ChatHook->>ChatHook: Format timestamps
    ChatHook-->>HistoryMdl: Return processed chat history
    
    HistoryMdl-->>User: Display organized chat history
    
    alt Search History
        User->>HistoryMdl: Enter search term
        HistoryMdl->>HistoryMdl: filterChats(searchTerm)
        HistoryMdl-->>User: Show filtered results
    else Filter by Date
        User->>HistoryMdl: Select date range
        HistoryMdl->>HistoryMdl: filterByDateRange(start, end)
        HistoryMdl-->>User: Show date-filtered results
    else Filter by Model
        User->>HistoryMdl: Select model filter
        HistoryMdl->>HistoryMdl: filterByModel(modelId)
        HistoryMdl-->>User: Show model-filtered results
    else Export Conversation
        User->>HistoryMdl: Click export on conversation
        HistoryMdl->>ChatHook: exportChat(chatId, format)
        ChatHook->>Firebase: Get complete chat data
        Firebase-->>ChatHook: Return messages
        ChatHook->>ChatHook: Format for export (JSON/Markdown/Text)
        ChatHook-->>HistoryMdl: Return formatted export
        HistoryMdl-->>User: Trigger download
    else Bulk Delete
        User->>HistoryMdl: Select multiple chats
        User->>HistoryMdl: Click "Delete Selected"
        HistoryMdl->>User: Show confirmation dialog
        User->>HistoryMdl: Confirm deletion
        HistoryMdl->>ContComp: handleBulkDelete(chatIds)
        ContComp->>ChatHook: bulkDeleteChats(chatIds)
        
        loop For each chat ID
            ChatHook->>Firebase: Delete chat document
            ChatHook->>Firebase: Delete chat messages
            Firebase-->>ChatHook: Confirm deletion
        end
        
        ChatHook-->>ContComp: Return success
        ContComp-->>HistoryMdl: Update history view
        HistoryMdl-->>User: Show success confirmation
    else Select Chat
        User->>HistoryMdl: Click on chat
        HistoryMdl->>ContComp: handleChatSelect(chatId)
        ContComp->>ChatHook: loadChatMessages(chatId)
        ChatHook->>Firebase: Get chat details
        Firebase-->>ChatHook: Return chat data
        ChatHook-->>ContComp: Return formatted chat
        ContComp->>ContComp: setCurrentSession(loadedChat)
        ContComp->>HistoryMdl: close()
        ContComp-->>User: Display selected chat
    end
```

## Error Handling Patterns

```mermaid
flowchart TD
    Error[Error Occurs]
    
    subgraph "Error Types"
        Network["Network Error\n- Connection lost\n- Timeout"]
        Auth["Auth Error\n- Invalid API key\n- Permission denied"]
        Model["Model Error\n- Invalid parameters\n- Token limit exceeded\n- Content policy violation"]
        Firebase["Firebase Error\n- Read/Write failure\n- Permission denied"]
    end
    
    Error --> Network
    Error --> Auth
    Error --> Model
    Error --> Firebase
    
    subgraph "Error Handling"
        Capture["Error Capture\n- try/catch blocks\n- Promise rejection handlers\n- Error boundaries"]
        Context["Error Context\n- DeploymentContext\n- error state"]
        Display["User Feedback\n- Toast notifications\n- Error messages\n- Error modals"]
        Recovery["Recovery Actions\n- Retry functionality\n- Alternative options\n- Fallback systems"]
    end
    
    Network --> Capture
    Auth --> Capture
    Model --> Capture
    Firebase --> Capture
    
    Capture --> Context
    Context --> Display
    Display --> Recovery
    Recovery -.-> Capture
```

## Performance Considerations

```mermaid
graph TD
    subgraph "Performance Optimizations"
        Virtualization["List Virtualization\n- Virtual chat history\n- Only render visible messages"]
        Memoization["Component Memoization\n- React.memo for pure components\n- useMemo for expensive calculations"]
        Lazy["Lazy Loading\n- Code splitting\n- Dynamic imports"]
        Throttling["Request Throttling\n- Debounce input handlers\n- Throttle API calls"]
    end
    
    subgraph "State Management"
        LocalState["Local State Optimization\n- Prefer local state when possible\n- Minimize prop drilling"]
        MsgCache["Message Caching\n- Cache recent messages\n- Minimize Firebase reads"]
        Pagination["Response Pagination\n- Paginate long histories\n- Infinite scrolling"]
    end
    
    subgraph "Resource Management"
        Cleanup["Proper Cleanup\n- Clear listeners in useEffect\n- Cancel API requests\n- Clear intervals/timeouts"]
        MemLeak["Memory Leak Prevention\n- Avoid closures over changing values\n- Watch for unintentional references"]
        EventCleanup["Event Listener Management\n- Remove unneeded listeners\n- Use passive listeners"]
    end
    
    Virtualization --> Performance
    Memoization --> Performance
    Lazy --> Performance
    Throttling --> Performance
    
    LocalState --> Performance
    MsgCache --> Performance
    Pagination --> Performance
    
    Cleanup --> Performance
    MemLeak --> Performance
    EventCleanup --> Performance
    
    Performance[Performance Outcome]
    
    Performance --> UserXP[Improved User Experience]
```

This document provides a comprehensive view of the Model Playground architecture, detailing component relationships, data flows, and interaction patterns. Each sequence diagram illustrates a specific user journey within the playground, highlighting the complex orchestration of frontend components, state management, external services, and persistent storage. 