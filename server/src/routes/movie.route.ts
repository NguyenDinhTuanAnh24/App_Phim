import { Router } from 'express';
import * as movieController from '../controllers/movie.controller';

const router = Router();

// Specific routes FIRST
router.get('/now-showing', movieController.getNowShowing);
router.get('/coming-soon', movieController.getComingSoon);
router.get('/search', movieController.searchMovies);
router.get('/suggestions', movieController.getSuggestions);
router.get('/genres', movieController.getAllGenres);

// Generic routes LAST
router.get('/', movieController.getMovies);
router.get('/:id', movieController.getMovieById);

export default router;
