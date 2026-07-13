// src/modules/search/search.controller.ts

import { Request, Response, NextFunction } from "express";
import searchService from "./search.service";

class SearchController {
  async global(req: Request, res: Response, next: NextFunction) {
    try {
      const keyword = (req.query.q as string) || "";

      const results = await searchService.searchAll(keyword);

      res.status(200).json({
        success: true,
        data: { results },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SearchController();