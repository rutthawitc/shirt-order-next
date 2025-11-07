// src/types/telegram.ts
export interface TelegramResponse {
  ok: boolean;
  result?: {
    message_id: number;
    chat: {
      id: number;
      type: string;
    };
    date: number;
    text?: string;
    photo?: Array<{
      file_id: string;
      file_size: number;
      width: number;
      height: number;
    }>;
  };
  description?: string;
}

export interface SendMessageParams {
  chat_id: string | number;
  text: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  disable_notification?: boolean;
}

export interface SendPhotoParams {
  chat_id: string | number;
  photo: string; // URL or file_id
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  disable_notification?: boolean;
}
