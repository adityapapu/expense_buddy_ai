"use server";
import OpenAI from 'openai';
import { listCategories } from './categoryService';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface TransactionSuggestion {
  description: string;
  categoryId: string | null;
  categoryName: string | null;
  confidence: number;
}

export async function generateTransactionSuggestion(
  merchantName: string,
  upiId: string,
  amount: number
): Promise<TransactionSuggestion> {
  try {
    // Get available categories
    const categoriesResponse = await listCategories({ pageSize: 100 });
    const categories = categoriesResponse.success ? categoriesResponse.categories : [];
    
    const expenseCategories = categories?.filter(cat => cat.type === 'EXPENSE') || [];
    const categoryList = expenseCategories.map(cat => `${cat.name} (${cat.id})`).join(', ');

    const prompt = `You are an AI assistant for an expense tracking app. Given the following payment information:
- Merchant/Business Name: "${merchantName}"
- UPI ID: "${upiId}"
- Amount: ₹${amount}

Available expense categories: ${categoryList}

Please analyze this payment information and provide:
1. A clear, descriptive transaction description (e.g., "Coffee at Starbucks", "Groceries at BigBasket")
2. The most appropriate category ID from the list above
3. A confidence score (0-1) for your categorization

Rules:
- Description should be concise but informative (max 50 characters)
- Only suggest a category ID that exists in the provided list
- Be conservative with confidence scores - use lower scores if uncertain
- Consider the merchant name and UPI ID context for better categorization

Respond in this exact JSON format:
{
  "description": "Generated description here",
  "categoryId": "category_id_from_list_or_null",
  "categoryName": "category_name_or_null", 
  "confidence": 0.85
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    try {
      const suggestion = JSON.parse(content) as TransactionSuggestion;
      
      // Validate the response
      if (!suggestion.description) {
        suggestion.description = `Payment to ${merchantName}`;
      }
      
      // Validate category exists
      if (suggestion.categoryId && !expenseCategories.find(cat => cat.id === suggestion.categoryId)) {
        suggestion.categoryId = null;
        suggestion.categoryName = null;
        suggestion.confidence = Math.max(0.1, suggestion.confidence - 0.3);
      }

      return suggestion;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      // Fallback response
      return {
        description: `Payment to ${merchantName}`,
        categoryId: null,
        categoryName: null,
        confidence: 0.1
      };
    }
  } catch (error) {
    console.error('Error generating transaction suggestion:', error);
    // Fallback response
    return {
      description: `Payment to ${merchantName || 'Unknown Merchant'}`,
      categoryId: null,
      categoryName: null,
      confidence: 0.1
    };
  }
}

export async function enhanceTransactionDescription(
  originalDescription: string,
  merchantName: string,
  amount: number
): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return originalDescription;
    }

    const prompt = `Improve this transaction description to be more clear and informative:
Original: "${originalDescription}"
Merchant: "${merchantName}"
Amount: ₹${amount}

Make it concise (max 50 characters) but descriptive. Examples:
- "Payment to Swiggy" → "Food delivery from Swiggy"  
- "UPI Transfer" → "Transfer to ${merchantName}"
- Keep it natural and user-friendly

Return only the improved description, no quotes or extra text.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 50,
    });

    const enhancedDescription = response.choices[0]?.message?.content?.trim();
    return enhancedDescription || originalDescription;
  } catch (error) {
    console.error('Error enhancing description:', error);
    return originalDescription;
  }
}