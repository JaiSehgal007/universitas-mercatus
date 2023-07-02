import express from 'express'
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';
import { categoryController, createCategoryController, daleteCategoryController, singleCategoryController, updateCategoryController } from '../controllers/categoryController.js';

const router = express.Router();

// routes
// create category
router.post('/create-category',requireSignIn,isAdmin, createCategoryController);

// update category, here the id passed in the parameter is the id of the category to be updated
router.put('/update-category/:id',requireSignIn,isAdmin,updateCategoryController);

// getAll category, we are not passing any middleware here as even if the user is not regitered, we will be showing categories to him
router.get('/get-category',categoryController);

// single category
router.get('/single-category/:slug',singleCategoryController);

// delete category
router.delete('/delete-category/:id',requireSignIn,isAdmin,daleteCategoryController);

export default router;