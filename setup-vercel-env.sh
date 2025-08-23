#!/bin/bash
# Setup Vercel Environment Variables for SubScout
# Run this script after: npx vercel link

echo "🚀 Setting up Vercel environment variables for SubScout..."

# Supabase variables (production & preview)
echo "Setting up Supabase variables..."
echo "https://zqtpbhyeegcjubshavaq.supabase.co" | npx vercel env add SUPABASE_URL production
echo "https://zqtpbhyeegcjubshavaq.supabase.co" | npx vercel env add SUPABASE_URL preview

echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxdHBiaHllZWdjanVic2hhdmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTI3MjksImV4cCI6MjA3MTQ4ODcyOX0.-w-OzViAsZSr8tSgCjjgH9dFVESOFx6FIJAiyNoVHyY" | npx vercel env add SUPABASE_ANON_KEY production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxdHBiaHllZWdjanVic2hhdmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTI3MjksImV4cCI6MjA3MTQ4ODcyOX0.-w-OzViAsZSr8tSgCjjgH9dFVESOFx6FIJAiyNoVHyY" | npx vercel env add SUPABASE_ANON_KEY preview

echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxdHBiaHllZWdjanVic2hhdmFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTkxMjcyOSwiZXhwIjoyMDcxNDg4NzI5fQ.J2bJBDC3g8JdCHxCcwLAVGgJgPttcGTFMQ7vaMIRGAo" | npx vercel env add SUPABASE_SERVICE_ROLE_KEY production --sensitive
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxdHBiaHllZWdjanVic2hhdmFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTkxMjcyOSwiZXhwIjoyMDcxNDg4NzI5fQ.J2bJBDC3g8JdCHxCcwLAVGgJgPttcGTFMQ7vaMIRGAo" | npx vercel env add SUPABASE_SERVICE_ROLE_KEY preview --sensitive

# Client-side Supabase variables
echo "Setting up client-side Supabase variables..."
echo "https://zqtpbhyeegcjubshavaq.supabase.co" | npx vercel env add VITE_SUPABASE_URL production
echo "https://zqtpbhyeegcjubshavaq.supabase.co" | npx vercel env add VITE_SUPABASE_URL preview

echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxdHBiaHllZWdjanVic2hhdmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTI3MjksImV4cCI6MjA3MTQ4ODcyOX0.-w-OzViAsZSr8tSgCjjgH9dFVESOFx6FIJAiyNoVHyY" | npx vercel env add VITE_SUPABASE_ANON_KEY production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxdHBiaHllZWdjanVic2hhdmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTI3MjksImV4cCI6MjA3MTQ4ODcyOX0.-w-OzViAsZSr8tSgCjjgH9dFVESOFx6FIJAiyNoVHyY" | npx vercel env add VITE_SUPABASE_ANON_KEY preview

# AI Services (sensitive)
echo "Setting up AI service variables..."
cat .env | grep PERPLEXITY_API_KEY | cut -d'=' -f2 | npx vercel env add PERPLEXITY_API_KEY production --sensitive
cat .env | grep PERPLEXITY_API_KEY | cut -d'=' -f2 | npx vercel env add PERPLEXITY_API_KEY preview --sensitive

cat .env | grep GEMINI_API_KEY | cut -d'=' -f2 | npx vercel env add GEMINI_API_KEY production --sensitive  
cat .env | grep GEMINI_API_KEY | cut -d'=' -f2 | npx vercel env add GEMINI_API_KEY preview --sensitive

# Reddit API (sensitive)
echo "Setting up Reddit API variables..."
cat .env | grep REDDIT_CLIENT_ID | cut -d'=' -f2 | npx vercel env add REDDIT_CLIENT_ID production --sensitive
cat .env | grep REDDIT_CLIENT_ID | cut -d'=' -f2 | npx vercel env add REDDIT_CLIENT_ID preview --sensitive

cat .env | grep REDDIT_CLIENT_SECRET | cut -d'=' -f2 | npx vercel env add REDDIT_CLIENT_SECRET production --sensitive
cat .env | grep REDDIT_CLIENT_SECRET | cut -d'=' -f2 | npx vercel env add REDDIT_CLIENT_SECRET preview --sensitive

# CORS Configuration (will need to update after first deploy)
echo "https://subscout.vercel.app" | npx vercel env add FRONTEND_URL production
echo "https://subscout.vercel.app" | npx vercel env add FRONTEND_URL preview

echo "✅ Environment variables setup complete!"
echo "📝 Remember to:"
echo "   1. Update FRONTEND_URL after your first deployment"
echo "   2. Run 'npx vercel env list' to verify all variables"
echo "   3. Deploy with 'npx vercel --prod'"