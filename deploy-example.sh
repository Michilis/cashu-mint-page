#!/bin/bash

# Example deployment script for Cashu Mint Page
# This script shows how to deploy the application with different base paths

echo "🚀 Cashu Mint Page Deployment Script"
echo ""

# Function to build and deploy
deploy() {
    local BASE_PATH=$1
    local DESCRIPTION=$2
    
    echo "📦 Building for: $DESCRIPTION"
    echo "   Base path: $BASE_PATH"
    
    # Set environment variable and build
    export VITE_BASE_PATH="$BASE_PATH"
    npm run build
    
    echo "✅ Build completed for $BASE_PATH"
    echo "   Files are in ./dist/"
    echo ""
}

# Show deployment options
echo "Choose deployment type:"
echo "1) Root path (/) - Default setup"
echo "2) Subpath (/21mint.me/) - Behind reverse proxy"
echo "3) Custom path - Enter your own"
echo "4) Multiple builds - Build all variants"
echo ""

read -p "Enter choice (1-4): " choice

case $choice in
    1)
        deploy "/" "Root path deployment"
        echo "📋 Deploy ./dist/ to your web server root"
        ;;
    2)
        deploy "/21mint.me/" "Subpath deployment"
        echo "📋 Deploy ./dist/ to your web server and configure proxy:"
        echo "   Nginx: location /21mint.me/ { proxy_pass http://localhost:5174/; }"
        ;;
    3)
        read -p "Enter custom base path (e.g., /cashu/): " custom_path
        deploy "$custom_path" "Custom path deployment"
        echo "📋 Deploy ./dist/ and configure your proxy for: $custom_path"
        ;;
    4)
        echo "🔄 Building multiple variants..."
        
        # Root deployment
        deploy "/" "Root path"
        mkdir -p builds/root
        cp -r dist/* builds/root/
        
        # Subpath deployment
        deploy "/21mint.me/" "21mint.me subpath"
        mkdir -p builds/21mint
        cp -r dist/* builds/21mint/
        
        # Another example
        deploy "/cashu/" "Cashu subpath"
        mkdir -p builds/cashu
        cp -r dist/* builds/cashu/
        
        echo "✅ All builds completed!"
        echo "📁 Builds available in:"
        echo "   ./builds/root/     - Root path deployment"
        echo "   ./builds/21mint/   - /21mint.me/ deployment"
        echo "   ./builds/cashu/    - /cashu/ deployment"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "📚 Next steps:"
echo "1. Upload the dist/ folder to your web server"
echo "2. Configure your reverse proxy (if using subpath)"
echo "3. Test the deployment"
echo ""
echo "🔗 Documentation: https://github.com/Michilis/cashu-mint-page" 