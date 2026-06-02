import re

app_path = 'd:\\Ecoshield\\Frontend\\src\\App.tsx'
with open(app_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import
if 'GoogleGenerativeAI' not in content:
    content = content.replace("import React,", "import { GoogleGenerativeAI } from '@google/generative-ai';\nimport React,")

# 2. Replace handleSendMessage
# We need to find const handleSendMessage = (text: string) => { and const getAiResponse = (userText: string) => { ... }
# The easiest way is to use regex or string replace.

old_func_start = "const handleSendMessage = (text: string) => {"
old_func_end = "const renderAiChatAssistant = () => {"

new_func = '''const handleSendMessage = async (text: string) => {
    if (isTyping) return;
    const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const userMsg = { sender: 'user' as const, text, time: timeStr };
    
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);
    
    try {
      const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY");
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash", 
        systemInstruction: "You are the EcoShield AI Assistant. You specialize in providing emergency guidance, climate resilience updates, and disaster management protocols for all of India. Provide brief, concise, and helpful answers."
      });
      const result = await model.generateContent(text);
      const aiText = result.response.text();
      const aiMsg = { sender: 'ai' as const, text: aiText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const fallbackText = "I'm having trouble connecting to the live neural network right now. Please check if the API key is valid or try again.";
      const aiMsg = { sender: 'ai' as const, text: fallbackText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
      setChatMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  '''

start_idx = content.find(old_func_start)
end_idx = content.find(old_func_end)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_func + content[end_idx:]

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated handleSendMessage to use Gemini")
