export interface MessageBlockData {
  type: 'text' | 'image' | 'video' | 'audio' | 'button';
  content: {
    text?: string;
    url?: string;
    buttonText?: string;
    actionType?: 'reply' | 'url' | 'next_step';
    response?: string;
  };
}

export interface AutomationConditionData {
  type: 'trigger' | 'audience' | 'keyword';
  operator?: 'contains_any' | 'contains_all' | 'exact_match';
  value: string[];
}

export interface AutomationActionData {
  type: 'send_message';
  messageBlocks: MessageBlockData[];
}

export interface AutomationRuleData {
  id: string;
  name: string;
  isActive: boolean;
  conditions: AutomationConditionData[];
  actions: AutomationActionData[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAutomationRequest {
  name: string;
  conditions: AutomationConditionData[];
  actions: AutomationActionData[];
}

export interface UpdateAutomationRequest {
  name?: string;
  isActive?: boolean;
  conditions?: AutomationConditionData[];
  actions?: AutomationActionData[];
}
