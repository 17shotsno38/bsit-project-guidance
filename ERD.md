# Guidance Application ERD

This document contains the Entity-Relationship Diagram (ERD) mapping out the data structures and relationships based on the backend node server functionality.

## Domain Model

```mermaid
erDiagram
    USER {
        string id PK
        string fullName
        string email
        string phone
        string studentId
        string academicProgram
        int yearLevel
        string avatar
        string assigned_counselor_id FK
    }

    PREFERENCE {
        string id PK
        string user_id FK
        boolean appointmentReminders
        boolean emailNotifications
        boolean calendarSync
    }

    COUNSELOR {
        string id PK
        string name
        string avatar
    }

    APPOINTMENT {
        int id PK
        string user_id FK
        string counselor_id FK
        int slot_id FK
        string tag "e.g., COUNSELING, ACADEMIC PREP"
        string detail
        datetime datetime
        string status
    }

    QUEUE {
        int id PK
        string counselor_id FK
        string status "e.g., active, paused"
    }
    
    QUEUE_PARTICIPANT {
        int id PK
        int queue_id FK
        string user_id FK
        datetime joinedAt
    }

    SLOT {
        int id PK
        string counselor_id FK
        datetime date
        string time
        boolean available
    }

    USER ||--o| PREFERENCE : "has one"
    USER }|--|| COUNSELOR : "assigned to"
    USER ||--o{ APPOINTMENT : "books"
    COUNSELOR ||--o{ APPOINTMENT : "hosts"
    COUNSELOR ||--o| QUEUE : "manages"
    QUEUE ||--o{ QUEUE_PARTICIPANT : "contains"
    USER ||--o{ QUEUE_PARTICIPANT : "joins"
    COUNSELOR ||--o{ SLOT : "creates"
    SLOT ||--o| APPOINTMENT : "reserved by"
```

### Explanation of Entities

1. **USER**: Represents the student utilizing the guidance application. This entity holds personal details, programmatic affiliation, and their direct relationship to an assigned counselor.
2. **PREFERENCE**: Holds application configuration flags for individual users such as email and calendar sync settings.
3. **COUNSELOR**: Represents the guidance staff whom students book appointments with and who oversee the walk-in queues.
4. **APPOINTMENT**: The relational nexus connecting Users and Counselors for scheduled meetings, complete with categorized tags, scheduled timestamps, and detailed descriptions.
5. **QUEUE**: Represents the live, asynchronous waiting line for immediate "walk-in" assistance managed per counselor.
6. **QUEUE_PARTICIPANT**: Tracks discrete users presently enqueued inside an active Queue line.
7. **SLOT**: Discrete blocks of reservable time assigned to a counselor that drive the calendar system.
