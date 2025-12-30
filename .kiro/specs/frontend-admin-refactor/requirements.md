# Requirements Document

## Introduction

Refactor the existing UmiJS-based frontend-admin project to a pure React + Ant Design architecture, implementing a modern dark theme management interface with multi-theme switching support, simplified project structure, and improved maintainability and development efficiency.

## Glossary

- **Frontend_Admin**: The frontend project for the second-hand marketplace backend management system
- **UmiJS**: The currently used React application framework
- **Pure_React**: A pure React application without UmiJS dependencies
- **Ant_Design**: UI component library
- **Vite**: The new build tool
- **React_Router**: Routing management library
- **Login_Page**: Login page component
- **Dashboard_Page**: Dashboard homepage component
- **Dark_Theme**: Dark theme mode
- **Light_Theme**: Light theme mode
- **Theme_Switcher**: Theme switching component
- **Build_System**: The application build and bundling system
- **Authentication_System**: User login and session management system
- **Navigation_System**: Application routing and menu navigation system

## Requirements

### Requirement 1: Project Architecture Migration

**User Story:** As a developer, I want to migrate the project from UmiJS to pure React architecture, so that I can simplify project structure and dependency management.

#### Acceptance Criteria

1. WHEN THE Build_System starts, THE System SHALL use Vite as the build tool instead of UmiJS
2. WHEN a developer views the project structure, THE System SHALL not contain UmiJS-related configuration files
3. WHEN THE Build_System builds the project, THE System SHALL generate standard React application build artifacts
4. THE System SHALL use React_Router for routing management
5. THE System SHALL maintain compatibility with existing Ant_Design components

### Requirement 2: Modern Dark Theme Interface Design

**User Story:** As a user, I want to see a modern, beautiful dark theme management interface, so that I can reduce eye strain during extended use.

#### Acceptance Criteria

1. THE System SHALL implement Dark_Theme as the default theme using deep blue background tones
2. THE System SHALL implement a left sidebar navigation containing menu items for Home, User Management, and System Management
3. THE System SHALL display the system title "二手商城管理后台", Theme_Switcher button, username, and user avatar dropdown menu in the top navigation
4. THE System SHALL provide a logout option in the user avatar dropdown menu
5. THE System SHALL use orange as the primary accent color for buttons and important elements
6. THE System SHALL use modern card-style layouts and rounded corner designs
7. THE System SHALL use appropriate text colors on dark backgrounds to ensure readability
8. THE System SHALL use gradient colors and shadow effects to enhance visual hierarchy
9. THE System SHALL support smooth animation transition effects

### Requirement 3: Dashboard Data Display

**User Story:** As an administrator, I want to see key business metrics and data visualization charts on the homepage, so that I can quickly understand business status.

#### Acceptance Criteria

1. THE System SHALL display key metric cards at the top of the homepage, including "Daily Average Orders" and "Period-over-Period Growth"
2. THE System SHALL display a sales revenue line chart with multiple data lines and data point annotations
3. THE System SHALL display a product category statistics bar chart using orange gradient bars
4. THE System SHALL display a payment method proportion pie chart using multiple colors to distinguish different payment methods
5. THE System SHALL display a member list table at the bottom, including fields for avatar, member name, username, consumption amount, registration, registration time, distance time, orders, and start time
6. THE System SHALL use appropriate chart libraries to implement data visualization
7. THE System SHALL support dynamic loading and updating of data

### Requirement 4: Multi-Theme System Support

**User Story:** As a user, I want to switch between dark and light themes, so that I can choose the appropriate interface style based on personal preferences and usage environment.

#### Acceptance Criteria

1. THE System SHALL support Dark_Theme as the default theme
2. THE System SHALL support Light_Theme switching
3. THE System SHALL provide a Theme_Switcher button in the top right of the navigation bar
4. WHEN a user clicks the Theme_Switcher button, THE System SHALL switch between Dark_Theme and Light_Theme
5. WHEN a user switches themes, THE System SHALL save the user's theme preference to local storage
6. WHEN a user revisits, THE System SHALL automatically apply the user's last selected theme
7. THE System SHALL ensure all components have good visual effects and contrast in different themes
8. THE System SHALL provide smooth transition animations during theme switching
9. THE System SHALL support automatic system theme detection (follow operating system theme)

### Requirement 5: PC Layout Design

**User Story:** As a user, I want to get a professional management interface experience on PC, with reasonable layout and complete functionality.

#### Acceptance Criteria

1. THE System SHALL be designed specifically for PC desktop environments, with minimum supported resolution of 1366x768
2. THE System SHALL display complete left sidebar navigation and multi-column data layout
3. THE System SHALL use fixed sidebar width without requiring collapse functionality
4. THE System SHALL optimize mouse interaction experience, including hover effects and click feedback
5. THE System SHALL fully utilize PC screen space to display more information

### Requirement 6: Top Navigation Bar Design

**User Story:** As a user, I want the top navigation bar to be clean and clear, containing necessary system information and user operation entry points.

#### Acceptance Criteria

1. THE System SHALL display the system title "二手商城管理后台" on the left side of the top navigation bar
2. THE System SHALL display from left to right in the top right of the navigation bar: Theme_Switcher button, username, user avatar
3. THE System SHALL design the user avatar as a clickable dropdown menu trigger
4. WHEN a user clicks the avatar, THE System SHALL display a dropdown menu containing a "Logout" option
5. WHEN a user clicks "Logout", THE Authentication_System SHALL clear user login state and redirect to the Login_Page
6. THE System SHALL not display search box, notification icons, or message icons in the top navigation
7. THE System SHALL use appropriate spacing and alignment to ensure the beauty of the top navigation bar

### Requirement 7: Login Page Design

**User Story:** As a user, I want the login page to have a professional and modern appearance, consistent with the overall design style.

#### Acceptance Criteria

1. THE System SHALL retain existing Login_Page functionality
2. THE System SHALL use Dark_Theme design consistent with the main interface
3. THE System SHALL use a centered card-style login form
4. THE System SHALL include "二手商城后台管理系统" brand identity
5. THE System SHALL support theme switching, with the Login_Page also responding to theme changes

### Requirement 8: PC Navigation System Implementation

**User Story:** As a user, I want the Navigation_System optimized for PC, with intuitive and efficient operation, allowing quick location of needed functional modules.

#### Acceptance Criteria

1. THE Navigation_System SHALL use a fixed left sidebar approximately 200-250px wide, containing icons and text labels
2. THE Navigation_System SHALL support mouse hover effects, providing good interaction feedback
3. WHEN a user selects a menu item, THE Navigation_System SHALL highlight the current active state
4. THE Navigation_System SHALL use orange background to highlight the currently selected menu item
5. THE Navigation_System SHALL be optimized for PC mouse operations, without requiring touch adaptation

### Requirement 9: Style System Architecture

**User Story:** As a developer, I want a flexible style system that supports theme customization and component style management.

#### Acceptance Criteria

1. THE System SHALL use CSS Variables for theme variable management
2. THE System SHALL support Less style preprocessor
3. THE System SHALL implement unified design tokens
4. THE System SHALL support Ant_Design theme customization
5. THE System SHALL use modular style file organization structure

### Requirement 10: Routing System Refactoring

**User Story:** As a user, I want page navigation functionality to work properly, allowing correct navigation between different pages.

#### Acceptance Criteria

1. WHEN a user accesses the root path, THE Navigation_System SHALL redirect to the Login_Page or homepage
2. WHEN an unauthenticated user accesses protected pages, THE Authentication_System SHALL redirect to the Login_Page
3. WHEN a user clicks navigation links, THE Navigation_System SHALL correctly navigate to the target page
4. THE Navigation_System SHALL support browser forward and back functionality
5. THE Navigation_System SHALL support state persistence after page refresh

### Requirement 11: Project Structure Simplification

**User Story:** As a developer, I want the project structure to be more concise and clear, so that it's easier to understand and maintain code.

#### Acceptance Criteria

1. WHEN a developer views the project structure, THE System SHALL only include the Login_Page and Dashboard_Page
2. THE System SHALL remove all unused pages and components
3. THE System SHALL remove UmiJS-specific configurations and conventions
4. THE System SHALL use standard React project structure
5. THE System SHALL maintain clear folder organization structure

### Requirement 12: Dependency Management Optimization

**User Story:** As a developer, I want project dependencies to be more streamlined, so that I can reduce bundle size and improve build speed.

#### Acceptance Criteria

1. THE System SHALL remove all UmiJS-related dependencies
2. THE System SHALL add necessary React, Vite, and React_Router dependencies
3. THE System SHALL retain Ant_Design and related UI dependencies
4. THE System SHALL add chart library dependencies for data visualization
5. WHEN installing project dependencies, THE Build_System SHALL complete installation faster than the original project

### Requirement 13: Build and Deployment Compatibility

**User Story:** As a DevOps engineer, I want the new project to build and deploy normally, without affecting existing deployment processes.

#### Acceptance Criteria

1. WHEN executing build commands, THE Build_System SHALL generate deployable static files
2. THE Build_System SHALL generate build artifacts that can run normally on web servers
3. THE System SHALL support environment variable configuration
4. THE System SHALL support proxy configuration for API calls
5. WHEN deploying to production environment, THE System SHALL work normally