// src/lib/logger.ts
import log from "loglevel";

// Define log levels and interaction types using const objects for erasableSyntaxOnly compatibility
export const LogLevel = {
  TRACE: "trace",
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export const InteractionType = {
  CLICK: "CLICK",
  FORM_SUBMIT: "FORM_SUBMIT",
  NAVIGATION: "NAVIGATION",
  DATA_LOAD: "DATA_LOAD",
  CONFIG_CHANGE: "CONFIG_CHANGE",
  VISUALIZATION_INTERACT: "VISUALIZATION_INTERACT",
  SIDEBAR_ACTION: "SIDEBAR_ACTION",
} as const;

export type InteractionType =
  (typeof InteractionType)[keyof typeof InteractionType];

interface LogContext {
  userId?: string;
  sessionId: string;
  timestamp: string;
  component: string;
  action: string;
  interactionType: InteractionType;
  data?: any;
  metadata?: Record<string, any>;
}

class DashboardLogger {
  private sessionId: string;
  private isEnabled: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled =
      import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOGGING === "true";

    // Configure loglevel
    if (this.isEnabled) {
      log.setLevel(LogLevel.DEBUG);
    } else {
      log.setLevel(LogLevel.WARN); // Only show warnings and errors in production
    }

    // Add custom styling for our logs
    this.setupLogStyles();

    // Log session start
    this.logInteraction(
      "SYSTEM",
      "session_started",
      InteractionType.NAVIGATION,
      {
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
    );
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupLogStyles(): void {
    // Add CSS for better log visibility in console
    const styles = `
      .dashboard-log { 
        font-weight: bold; 
        color: #2563eb; 
      }
      .interaction-log { 
        background: linear-gradient(90deg, #3b82f6, #1d4ed8); 
        color: white; 
        padding: 2px 6px; 
        border-radius: 4px; 
      }
    `;

    if (typeof document !== "undefined") {
      const styleSheet = document.createElement("style");
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }
  }

  /**
   * Log user interactions with rich context
   */
  logInteraction(
    component: string,
    action: string,
    interactionType: InteractionType,
    data?: any,
    metadata?: Record<string, any>,
  ): void {
    if (!this.isEnabled) return;

    const context: LogContext = {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      component,
      action,
      interactionType,
      data,
      metadata: {
        url: typeof window !== "undefined" ? window.location.href : "",
        viewport:
          typeof window !== "undefined"
            ? {
                width: window.innerWidth,
                height: window.innerHeight,
              }
            : null,
        ...metadata,
      },
    };

    // Use different log levels based on interaction type
    switch (interactionType) {
      case InteractionType.CLICK:
      case InteractionType.FORM_SUBMIT:
      case InteractionType.VISUALIZATION_INTERACT:
        log.info(
          `%c🖱️ USER INTERACTION`,
          "background: #3b82f6; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;",
          `${component}.${action}`,
          context,
        );
        break;

      case InteractionType.DATA_LOAD:
        log.info(
          `%c📊 DATA OPERATION`,
          "background: #059669; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;",
          `${component}.${action}`,
          context,
        );
        break;

      case InteractionType.CONFIG_CHANGE:
        log.warn(
          `%c⚙️ CONFIG CHANGE`,
          "background: #d97706; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;",
          `${component}.${action}`,
          context,
        );
        break;

      case InteractionType.NAVIGATION:
        log.info(
          `%c🧭 NAVIGATION`,
          "background: #7c3aed; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;",
          `${component}.${action}`,
          context,
        );
        break;

      default:
        log.debug(`📝 ${component}.${action}`, context);
    }
  }

  /**
   * Log errors with full context
   */
  logError(
    component: string,
    action: string,
    error: Error | string,
    metadata?: Record<string, any>,
  ): void {
    const context: LogContext = {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      component,
      action,
      interactionType: InteractionType.DATA_LOAD, // Default for errors
      data:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : { message: error },
      metadata,
    };

    log.error(
      `%c❌ ERROR`,
      "background: #dc2626; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;",
      `${component}.${action}`,
      context,
    );
  }

  /**
   * Log performance metrics
   */
  logPerformance(
    component: string,
    action: string,
    duration: number,
    metadata?: Record<string, any>,
  ): void {
    if (!this.isEnabled) return;

    log.info(
      `%c⚡ PERFORMANCE`,
      "background: #84cc16; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;",
      `${component}.${action} took ${duration}ms`,
      { sessionId: this.sessionId, duration, metadata },
    );
  }

  /**
   * Get current session info
   */
  getSessionInfo(): { sessionId: string; isEnabled: boolean } {
    return {
      sessionId: this.sessionId,
      isEnabled: this.isEnabled,
    };
  }
}

// Create singleton instance
export const dashboardLogger = new DashboardLogger();

// Convenience functions for common use cases
export const logClick = (component: string, element: string, data?: any) => {
  dashboardLogger.logInteraction(
    component,
    `click_${element}`,
    InteractionType.CLICK,
    data,
  );
};

export const logFormSubmit = (component: string, form: string, data?: any) => {
  dashboardLogger.logInteraction(
    component,
    `submit_${form}`,
    InteractionType.FORM_SUBMIT,
    data,
  );
};

export const logNavigation = (
  component: string,
  destination: string,
  data?: any,
) => {
  dashboardLogger.logInteraction(
    component,
    `navigate_to_${destination}`,
    InteractionType.NAVIGATION,
    data,
  );
};

export const logDataOperation = (
  component: string,
  operation: string,
  data?: any,
) => {
  dashboardLogger.logInteraction(
    component,
    operation,
    InteractionType.DATA_LOAD,
    data,
  );
};

export const logConfigChange = (
  component: string,
  setting: string,
  newValue: any,
  oldValue?: any,
) => {
  dashboardLogger.logInteraction(
    component,
    `config_${setting}`,
    InteractionType.CONFIG_CHANGE,
    {
      newValue,
      oldValue,
    },
  );
};

export const logVisualizationInteraction = (
  component: string,
  action: string,
  data?: any,
) => {
  dashboardLogger.logInteraction(
    component,
    action,
    InteractionType.VISUALIZATION_INTERACT,
    data,
  );
};

// Export the main logger instance
export default dashboardLogger;
