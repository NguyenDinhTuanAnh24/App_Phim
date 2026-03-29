import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllFoodCombos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const foodCombos = await prisma.foodCombo.findMany({
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image_url: true,
      }
    });

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách combo thành công',
      data: foodCombos
    });
  } catch (error) {
    next(error);
  }
};