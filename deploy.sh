JEKYLL_ENV=production bundle exec jekyll build 
git add -A .
git commit -m "Changes"
git push origin release
rm -rf ../site
mkdir ../site
cd ../site
git clone -b master https://github.com/javiercancela/javiercancela.github.io.git
cd javiercancela.github.io/
rm -rf ./*
