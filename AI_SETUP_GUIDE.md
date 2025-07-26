# AI Features Setup Guide

## 🚀 Backend-Powered AI Integration with OpenRouter

Your SlideMaker application now includes powerful AI features that work seamlessly without requiring users to enter their own API keys. All AI requests are handled by your backend service using OpenRouter, which provides access to multiple AI models through a unified API.

## 📋 Setup Instructions

### 1. Get Your OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up or log in to your account
3. Navigate to **Keys** section at [https://openrouter.ai/keys](https://openrouter.ai/keys)
4. Click **"Create Key"**
5. Copy the key (starts with `sk-or-...`)

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your OpenRouter API key:
   ```env
   OPENROUTER_API_KEY=sk-or-your-actual-api-key-here
   ```

### 3. Restart Your Development Server

```bash
npm run dev
```

## ✨ AI Features Available

### 🎯 AI Content Generator
- **Location**: Available in the header when editing presentations
- **Features**: 
  - Generate individual slides with AI-powered content
  - Multiple slide types: Title, Content, Bullet Points, Agenda, Overview, Conclusion
  - Customizable tone: Professional, Casual, Academic, Creative
  - Audience targeting and context awareness

### 🎨 AI Presentation Generator
- **Location**: Available in header and welcome screen
- **Features**:
  - Generate complete presentations from a single topic
  - Smart outline creation with logical flow
  - Duration-based content planning (5-60 minutes)
  - Key points integration
  - Automatic template selection

### 🔧 Backend API Endpoints

Your application now includes these API routes:

- `POST /api/ai/generate-slide` - Generate individual slide content
- `POST /api/ai/generate-presentation` - Generate complete presentation outlines
- `POST /api/ai/improve-content` - Improve existing slide content

## 🔒 Security & Privacy

- **Server-Side Processing**: All AI requests are processed on your server via OpenRouter
- **API Key Protection**: Your OpenRouter API key is never exposed to users
- **No User Setup**: Users can access AI features immediately without configuration
- **Rate Limiting**: Consider implementing rate limiting for production use
- **Model Flexibility**: Easy to switch between different AI models through OpenRouter

## 💡 User Experience

### For Users:
1. **No Setup Required**: AI features work immediately
2. **Seamless Integration**: AI buttons appear naturally in the interface
3. **Instant Results**: Generate content with a few clicks
4. **Professional Quality**: AI-generated content is optimized for presentations

### For Developers:
1. **Clean Architecture**: Frontend and backend are properly separated
2. **Error Handling**: Comprehensive error handling and user feedback
3. **Scalable Design**: Easy to extend with additional AI features
4. **Type Safety**: Full TypeScript support throughout

## 🚀 Production Deployment

### Environment Variables
Ensure these environment variables are set in your production environment:

```env
OPENROUTER_API_KEY=your_production_openrouter_key
```

### Rate Limiting (Recommended)
Consider implementing rate limiting to control API usage:

```typescript
// Example rate limiting middleware
import rateLimit from 'express-rate-limit';

const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many AI requests, please try again later.'
});
```

### Monitoring
Monitor your API usage through the OpenRouter dashboard to track:
- Request volume
- Token usage
- Costs across different models
- Error rates
- Model performance comparisons

## 🎯 Usage Examples

### Generate a Single Slide
1. Open any presentation
2. Click "AI Generate" in the header
3. Enter topic: "Digital Marketing ROI"
4. Select slide type: "Bullet Points"
5. Choose tone: "Professional"
6. Click "Generate Content"
7. Review and click "Create Slide"

### Generate Complete Presentation
1. From welcome screen or header, click "AI Presentation"
2. Enter topic: "Sustainable Business Practices"
3. Set audience: "Business executives"
4. Choose duration: 20 minutes
5. Add key points (optional)
6. Click "Generate Outline"
7. Review outline and click "Create Presentation"

## 🔮 Future Enhancements

The architecture supports easy addition of new AI features:

- **Content Improvement**: Enhance existing slides with AI suggestions
- **Style Recommendations**: AI-powered design suggestions
- **Speaker Notes**: Generate presenter notes automatically
- **Multi-language Support**: Generate content in different languages
- **Custom Prompts**: Allow advanced users to create custom AI prompts
- **Batch Processing**: Generate multiple slides simultaneously

## 🆘 Troubleshooting

### Common Issues:

1. **"OpenRouter API key not configured"**
   - Check that `OPENROUTER_API_KEY` is set in `.env.local`
   - Restart your development server

2. **"Failed to generate content"**
   - Verify your OpenRouter API key is valid
   - Check your OpenRouter account has sufficient credits
   - Review server logs for detailed error messages
   - Try switching to a different model if one is unavailable

3. **Slow AI responses**
   - This is normal for AI generation (typically 3-10 seconds)
   - Consider adding loading indicators for better UX

### Debug Mode:
Enable detailed logging by adding to your `.env.local`:
```env
DEBUG=true
```

## 📊 Cost Management

### OpenAI Pricing (as of 2024):
- **GPT-3.5-turbo**: ~$0.002 per 1K tokens
- **Average slide generation**: ~500-1000 tokens
- **Estimated cost per slide**: $0.001-$0.002

### Cost Optimization Tips:
1. Use GPT-3.5-turbo instead of GPT-4 for cost efficiency
2. Implement caching for similar requests
3. Set reasonable token limits
4. Monitor usage through OpenAI dashboard

Your AI-powered presentation tool is now ready to provide users with seamless, professional content generation capabilities!