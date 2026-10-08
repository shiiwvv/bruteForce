import express , {Router} from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import  {handleCreateListReq , handleAddProblemToListReq , handleAddMultipleProblemToListReq , handleUpdateListReq , handleDeleteListReq , handleRemoveProblemFromListReq , handleGetAllListReq , handleGetParticularList} from '../controllers/list.controllers.js';

const listRouter = new Router();

listRouter.use(verifyJWT);

listRouter
    .route('/create')
    .post(handleCreateListReq);

listRouter
    .route('/add-single/:listId/:problemId')
    .patch(handleAddProblemToListReq);

listRouter  
    .route('/remove-single/:listId/:problemId')
    .patch(handleRemoveProblemFromListReq);

listRouter  
    .route('/add-problems/:listId')
    .patch(handleAddMultipleProblemToListReq);

listRouter
    .route('/update/:listId')
    .patch(handleUpdateListReq);

listRouter
    .route('/delete/:listId')
    .delete(handleDeleteListReq);
    
listRouter
    .route('/get-all/')
    .get(handleGetAllListReq);

listRouter
    .route('/get-list/:listId')
    .get(handleGetParticularList);

export {listRouter};