// Concise primary-card labels for the home conversation node.
// These intentionally remove the equivalent of “practice” from the primary
// card title while leaving Today’s Plan/module descriptions free to be more
// specific where needed.

function conversationTitle(title) {
  return {
    home: {
      scenic: {
        conversation: { title }
      }
    }
  };
}

export const scenicHomeConversationLabelOverrides = {
  english: conversationTitle('Conversation'),
  spanish: conversationTitle('Conversación'),
  french: conversationTitle('Conversation'),
  portuguese: conversationTitle('Conversação'),
  hebrew: conversationTitle('שיחה'),
  arabic: conversationTitle('المحادثة'),
  russian: conversationTitle('Разговор'),
  japanese: conversationTitle('会話'),
  mandarin: conversationTitle('对话'),
  amharic: conversationTitle('ውይይት'),
  hindi: conversationTitle('बातचीत'),
  bengali: conversationTitle('কথোপকথন')
};
