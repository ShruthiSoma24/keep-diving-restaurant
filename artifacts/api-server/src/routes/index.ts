import { Router, type IRouter } from "express";
import healthRouter from "./health";
import restaurantRouter from "./restaurant";
import menuRouter from "./menu";
import ordersRouter from "./orders";
import bookingsRouter from "./bookings";
import reviewsRouter from "./reviews";

const router: IRouter = Router();

router.use(healthRouter);
router.use(restaurantRouter);
router.use(menuRouter);
router.use(ordersRouter);
router.use(bookingsRouter);
router.use(reviewsRouter);

export default router;
