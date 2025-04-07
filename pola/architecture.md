# Polaris Dashboard Architecture

This document outlines the architecture of the Polaris Dashboard project, providing visual representations of its component structure, data flow, and system interactions.

## Core Architecture Overview

```mermaid
flowchart TD
    subgraph "Frontend Layer"
        UI[UI Components]
        Screens[Screen Components]
        Hooks[Custom Hooks]
    end
    
    subgraph "State Management"
        Context[React Context API]
        LocalState[Component State]
    end
    
    subgraph "Services Layer"
        DS[Deployment Service]
        LS[Logs Service]
        WS[Wallet Service]
        CS[Chat Service]
    end
    
    subgraph "External Services"
        Firebase[Firebase]
        HF[Hugging Face API]
        DeployAPI[Deployment API]
    end
    
    UI --> Context
    UI --> LocalState
    Screens --> Hooks
    Hooks --> DS
    Hooks --> LS
    Hooks --> WS
    Hooks --> CS
    DS --> Firebase
    DS --> DeployAPI
    LS --> Firebase
    WS --> Firebase
    CS --> HF
    CS --> DeployAPI
    Firebase --> Context
    DeployAPI --> Context
    HF --> Context
```

## Component Structure

```mermaid
classDiagram
    class AppRoot {
        +render()
    }
    
    class SubnetHome {
        +state: activeNav
        +state: darkMode
        +state: userAuth
        +handleNavClick()
        +updateDarkMode()
    }
    
    class Dashboard {
        +state: clusters
        +state: filters
        +fetchResources()
        +renderMetrics()
    }
    
    class AIStudio {
        +state: models
        +state: selectedModel
        +handleModelSelection()
        +handleDeployment()
    }
    
    class ModelPlayground {
        +state: chatHistory
        +state: userInput
        +state: modelConfig
        +sendMessage()
        +handleModelChange()
    }
    
    class DeploymentContext {
        +state: activeDeployment
        +state: error
        +startDeployment()
        +finishDeployment()
        +setDeploymentError()
    }
    
    AppRoot --> SubnetHome
    SubnetHome --> Dashboard
    SubnetHome --> AIStudio
    SubnetHome --> ModelPlayground
    ModelPlayground --> DeploymentContext
    AIStudio --> DeploymentContext
```

## Data Flow Architecture

```
┌────────────────────────┐     ┌───────────────────────┐     ┌────────────────────────┐
│                        │     │                       │     │                        │
│      User Interface    │◄────┤    State Management   │◄────┤     External APIs      │
│                        │     │                       │     │                        │
└───────────┬────────────┘     └─────────┬─────────────┘     └──────────┬─────────────┘
            │                            │                              │
            ▼                            ▼                              ▼
┌────────────────────────┐     ┌───────────────────────┐     ┌────────────────────────┐
│                        │     │                       │     │                        │
│   User Interactions    │────►│    Service Layer      │────►│     Firebase/Cloud     │
│                        │     │                       │     │                        │
└────────────────────────┘     └───────────────────────┘     └────────────────────────┘
```

## Firebase Integration

```mermaid
flowchart LR
    subgraph "Firebase Services"
        Auth[Authentication]
        Firestore[Firestore Database]
        Storage[Cloud Storage]
    end
    
    subgraph "Application"
        AuthHooks[Auth Hooks]
        DataHooks[Data Hooks]
        FileHooks[File Operations]
    end
    
    Auth <--> AuthHooks
    Firestore <--> DataHooks
    Storage <--> FileHooks
    
    subgraph "Data Collections"
        Users[Users]
        Models[Models]
        Deployments[Deployments]
        Logs[Logs]
        Transactions[Transactions]
    end
    
    Firestore --- Users
    Firestore --- Models
    Firestore --- Deployments
    Firestore --- Logs
    Firestore --- Transactions
```

## Model Deployment Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as UI Components
    participant Context as Deployment Context
    participant Service as Deployment Service
    participant API as Deployment API
    participant Firebase as Firestore
    
    User->>UI: Select model to deploy
    UI->>Context: startDeployment(modelId)
    Context->>Service: deployModel(modelId, config)
    Service->>API: POST /api/v1/deployments
    API-->>Service: Return deploymentId
    Service->>Firebase: Create deployment document
    Service->>Context: Update deployment status
    
    loop Status Polling
        Service->>API: GET /api/v1/deployments/{id}/status
        API-->>Service: Return current status
        Service->>Firebase: Update deployment status
        Firebase-->>Context: Trigger status update
        Context-->>UI: Render updated status
    end
    
    alt Deployment Success
        Context->>UI: Show success message
        UI->>User: Display deployed model interface
    else Deployment Failure
        Context->>UI: Show error details
        UI->>User: Display retry options
    end
```

## Model Chat Interaction Flow

```mermaid
sequenceDiagram
    participant User
    participant PlayUI as Playground UI
    participant ChatHook as Chat API Hook
    participant ChatCache as Message Cache
    participant Firebase as Firestore
    participant ModelAPI as Model API Endpoint
    
    User->>PlayUI: Enter message & send
    
    PlayUI->>PlayUI: Optimistically add message to UI
    PlayUI->>ChatHook: sendMessage(chatId, message)
    
    alt New Chat
        ChatHook->>Firebase: Create new chat session
        Firebase-->>ChatHook: Return chatId
    end
    
    alt Private Model
        ChatHook->>Firebase: Retrieve API key for model
        Firebase-->>ChatHook: Return API key
        
        ChatHook->>ModelAPI: POST /v1/chat/completions
        Note over ChatHook,ModelAPI: With API key & model-specific parameters
    else Public/Managed Model
        ChatHook->>ModelAPI: POST to managed endpoint
    end
    
    ModelAPI-->>ChatHook: Stream response tokens
    
    loop For each response token
        ChatHook-->>PlayUI: Update UI with partial response
        PlayUI-->>User: Show incremental response
    end
    
    ChatHook->>Firebase: Store complete conversation
    ChatHook->>ChatCache: Update message cache
    
    ChatHook-->>PlayUI: Complete response signal
    PlayUI-->>User: Enable next interaction
    
    alt Error occurs
        ModelAPI-->>ChatHook: Error response
        ChatHook-->>PlayUI: Show error message
        PlayUI-->>User: Display retry option
    end
    
    User->>PlayUI: Request conversation history
    PlayUI->>ChatHook: loadChatHistory()
    ChatHook->>Firebase: Query chats collection
    Firebase-->>ChatHook: Return chat history
    ChatHook-->>PlayUI: Formatted chat history
    PlayUI-->>User: Display conversation history
```

## Model Playground Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│                        Model Playground Component                          │
├───────────────┬───────────────────────────────────┬─────────────────────┬─┘
│ Left Sidebar  │        Main Chat Area             │   Right Sidebar     │
│               │                                   │                     │
│ ┌───────────┐ │ ┌───────────────────────────────┐ │ ┌─────────────────┐ │
│ │ Chat      │ │ │                               │ │ │  Model Select   │ │
│ │ Projects  │ │ │                               │ │ │                 │ │
│ │           │ │ │       Message History         │ │ │ ┌─────────────┐ │ │
│ ├───────────┤ │ │                               │ │ │ │ Temperature │ │ │
│ │ History   │ │ │                               │ │ │ ├─────────────┤ │ │
│ │ List      │ │ │                               │ │ │ │ Max Tokens  │ │ │
│ │           │ │ │                               │ │ │ ├─────────────┤ │ │
│ ├───────────┤ │ ├───────────────────────────────┤ │ │ │ System      │ │ │
│ │           │ │ │ ┌───────────────────────────┐ │ │ │ │ Prompt      │ │ │
│ │  Project  │ │ │ │    Message Input          │ │ │ │ │             │ │ │
│ │  Actions  │ │ │ └───────────────────────────┘ │ │ └─────────────┘ │ │
│ │           │ │ │                               │ │                 │ │
└───────────────┴───────────────────────────────────┴─────────────────────┘
```

## System Component Hexagonal Architecture

```
                ┌───────────────┐                                      
                │               │                                      
                │  UI Layer     │                                      
                │               │                                      
                └───────┬───────┘                                      
                        │                                              
                        ▼                                              
┌───────────────┐   ┌───────────────┐   ┌───────────────┐              
│               │   │               │   │               │              
│  AIStudio     │◄──┤  Core Logic   ├──►│  Dashboard    │              
│  Components   │   │  & State      │   │  Components   │              
│               │   │               │   │               │              
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘              
        │                   │                   │                      
        │                   ▼                   │                      
        │           ┌───────────────┐           │                      
        │           │               │           │                      
        └───────────┤   Services    ├───────────┘                      
                    │   Layer       │                                  
                    │               │                                  
                    └───────┬───────┘                                  
                            │                                          
                            ▼                                          
                    ┌───────────────┐                                  
                    │               │                                  
                    │  External     │                                  
                    │  Resources    │                                  
                    │               │                                  
                    └───────────────┘                                  
```

## Technology Stack

```mermaid
graph TD
    subgraph "Frontend"
        React[React]
        Vite[Vite]
        Tailwind[Tailwind CSS]
        MUI[Material UI Components]
    end
    
    subgraph "State Management"
        Context[Context API]
        Hooks[Custom Hooks]
    end
    
    subgraph "Backend"
        Firebase[Firebase]
        CustomAPI[Deployment API]
    end
    
    subgraph "External Services"
        HF[HuggingFace API]
        Stripe[Stripe Payments]
        AI[AI Model APIs]
    end
    
    React --> Context
    Vite --> React
    Tailwind --> React
    MUI --> React
    Context --> Firebase
    Hooks --> Firebase
    Hooks --> CustomAPI
    CustomAPI --> AI
    Firebase --> Stripe
    Hooks --> HF
```

## Key Feature Relationships

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─────────────┐         ┌────────────────┐         ┌─────────────────┐ │
│  │             │         │                │         │                 │ │
│  │ AI Model    │─────────┤ Model          ├─────────┤ AI Studio      │ │
│  │ Management  │         │ Playground     │         │ Interface      │ │
│  │             │         │                │         │                 │ │
│  └─────────────┘         └────────────────┘         └─────────────────┘ │
│         │                       │                          │            │
│         │                       │                          │            │
│         ▼                       ▼                          ▼            │
│  ┌─────────────┐         ┌────────────────┐         ┌─────────────────┐ │
│  │             │         │                │         │                 │ │
│  │ Deployment  │─────────┤ Monitoring     ├─────────┤ Analytics      │ │
│  │ Service     │         │ & Logs         │         │ Dashboard      │ │
│  │             │         │                │         │                 │ │
│  └─────────────┘         └────────────────┘         └─────────────────┘ │
│         │                       │                          │            │
│         │                       │                          │            │
│         ▼                       ▼                          ▼            │
│  ┌─────────────┐         ┌────────────────┐         ┌─────────────────┐ │
│  │             │         │                │         │                 │ │
│  │ User        │─────────┤ Billing &      ├─────────┤ Community      │ │
│  │ Management  │         │ Payments       │         │ Features       │ │
│  │             │         │                │         │                 │ │
│  └─────────────┘         └────────────────┘         └─────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Deployment Infrastructure

```mermaid
flowchart TD
    subgraph "Cloud Infrastructure"
        Firebase[Firebase Services]
        DeployServ[Deployment Services]
        ModelServ[Model Serving]
    end
    
    subgraph "Client Application"
        WebApp[Web Dashboard]
    end
    
    WebApp <--> Firebase
    WebApp <--> DeployServ
    WebApp <--> ModelServ
    
    subgraph "Firebase Services"
        Auth[Authentication]
        Store[Firestore]
        Storage[Cloud Storage]
        Functions[Cloud Functions]
    end
    
    Firebase --- Auth
    Firebase --- Store
    Firebase --- Storage
    Firebase --- Functions
    
    subgraph "AI Infrastructure"
        Models[Model Repository]
        Inference[Inference Endpoints]
        Monitoring[Metrics & Monitoring]
    end
    
    ModelServ --- Models
    ModelServ --- Inference
    ModelServ --- Monitoring
```

This architecture documentation provides a comprehensive overview of the Polaris Dashboard system, illustrating its component relationships, data flow, and integration with external services...