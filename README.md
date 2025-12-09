# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## Steps To push to code from code space to git pre/beta

Step 1 :Check the remote version using the below command 1.
- git remote -v

origin  https://github.com/PetCarePlus/pet-care-client (fetch)

origin  https://github.com/PetCarePlus/pet-care-client (push)

if it’s not that then set the URL using below command :
 -  git remote set-url origin https://github.com/PetCarePlus/pet-care-client.git


Step2 : By default Codespace will clone only one branch to clone all the branches use the below command
-   git fetch --all

Step 3: 	You will  now have access to all the branches to list them use this command
-  git branch -r
-  git pull origin pre/beta

   
Step 4:  Make a local branch on code space using the below command replace the branch name with your branch 
-  git checkout -b _002-kumara_ origin/_002-kumara_
- Change the one in Italic with your branch names  try to give the same names so while commiting it wont cause issues
		

Step 5:  Now commit the changes into your local branch and push them 
-   git add —all
-   git commit -m “commit Message”
-   git push


Step 6: Now push the changes from your remote branch to pre/beta

- git checkout pre/beta
- git pull origin pre/beta
- git merge origin 002-kumara
- git push origin pre/beta
