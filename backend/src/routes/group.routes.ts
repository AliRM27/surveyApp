import { Router } from "express";
import { z } from "zod";
import {
  addMember,
  createGroup,
  getGroup,
  joinGroupByCode,
  listGroups,
  removeMember,
} from "../controllers/group.controller";
import { validateRequest } from "../middlewares/validateRequest";

const router = Router();

const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  teacherId: z.string().min(1),
  memberIds: z.array(z.string()).optional(),
  groupCode: z.string().min(1).optional(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6})$/, "Color must be a hex value like #AABBCC")
    .optional(),
});

const idParamSchema = z.object({ id: z.string().min(1) });
const addMemberSchema = z.object({ memberId: z.string().min(1) });
const joinByCodeSchema = z.object({
  groupCode: z.string().min(1),
  memberId: z.string().min(1),
});
const removeMemberParamsSchema = z.object({
  id: z.string().min(1),
  memberId: z.string().min(1),
});

router.post("/", validateRequest(createGroupSchema), createGroup);
router.get("/", listGroups);
router.get("/:id", validateRequest(idParamSchema, "params"), getGroup);
router.post(
  "/:id/members",
  validateRequest(idParamSchema, "params"),
  validateRequest(addMemberSchema),
  addMember,
);
router.post("/join", validateRequest(joinByCodeSchema), joinGroupByCode);
router.delete(
  "/:id/members/:memberId",
  validateRequest(removeMemberParamsSchema, "params"),
  removeMember,
);

export default router;
