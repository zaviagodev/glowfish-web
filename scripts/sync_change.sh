#!/bin/bash

#  sync the changes from the Bolt.new codebase with your project: 
 
#  Pulls the latest changes from the GitHub repository. 
#  Creates a new branch with the name of the current date and time. 
#  Deletes all files in the repository except the  .git  directory. 
#  Copies the downloaded Bolt.new code into the repository. 
#  Stages, commits, and pushes the changes to the new branch. 
#  Checks out to the original branch. 
#  Merges the new branch with the original branch. 
#  Pushes the changes to the original branch. 

# Path to downloaded Bolt.new code
BOLT_CODE_DIR="downloaded"
PROJECT_DIR="."
DEVELOPER=$(git config user.name)

# Move to the local Git repository
cd $PROJECT_DIR || { echo "Project directory not found"; exit 1; }

# check if BOLT_CODE_DIR exists
if [ ! -d "$BOLT_CODE_DIR" ]; then
  echo "please provide the path to the Bolt.new code directory"
  read BOLT_CODE_DIR
fi

CURRENT_BRANCH=$(git branch --show-current)

# Pull latest changes
echo "Pulling latest changes from GitHub..."
git pull

# take a message input from the user
echo "Enter the commit message: "
read COMMIT_MESSAGE

# create a new branch with name of the current developer and date and time
BRANCH_NAME="$DEVELOPER-$(date +'%Y-%m-%d-%H')"
echo "Creating new branch $BRANCH_NAME..."
git checkout -b $BRANCH_NAME

# Delete all files in the repository except .git and BOLT_CODE_DIR
echo "Deleting all files in the repository except .git..."
find . -not -path "./.git/*" -not -path "./$BOLT_CODE_DIR/*" -delete

# Copy downloaded Bolt.new code into the repository
echo "Copying Bolt.new code into the repository..."
cp -r $BOLT_CODE_DIR/* $PROJECT_DIR

# Add, commit, and push changes
echo "Staging and committing changes..."
git add .
git commit -m "$COMMIT_MESSAGE ($BRANCH_NAME)"

echo "Pushing changes to GitHub..."
git push origin $BRANCH_NAME

echo "checkout to $CURRENT_BRANCH"
git checkout $CURRENT_BRANCH

echo "Merging the $BRANCH_NAME with $CURRENT_BRANCH"
git merge $BRANCH_NAME

echo "Pushing changes to GitHub..."
git push origin $CURRENT_BRANCH

echo "updated $CURRENT_BRANCH with the latest changes from Bolt.new"

# clear the $BOLT_CODE_DIR directory
rm -rf $BOLT_CODE_DIR
mkdir $BOLT_CODE_DIR