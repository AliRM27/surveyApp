import { Request, Response } from "express";
import { GroupModel } from "../models/group.model";
import { UserModel } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";

export const createGroup = asyncHandler(async (req: Request, res: Response) => {
  const { name, teacherId, memberIds = [], groupCode, color } = req.body;

  const teacher = await UserModel.findById(teacherId);
  if (!teacher || teacher.role !== "teacher") {
    return res.status(400).json({ message: "Teacher not found or invalid." });
  }

  const ensureUniqueCode = async (code?: string): Promise<string> => {
    const generateRandom = () =>
      Array.from({ length: 6 })
        .map(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.floor(Math.random() * 36)))
        .join("");

    let attempts = 0;
    let finalCode = code || generateRandom();
    // try a few times to avoid collisions
    while (attempts < 5) {
      const existing = await GroupModel.findOne({ groupCode: finalCode }).lean();
      if (!existing) break;
      finalCode = generateRandom();
      attempts += 1;
    }
    return finalCode;
  };

  const validMembers = await UserModel.find({
    _id: { $in: memberIds },
    role: "student",
  }).select("_id");

  const finalCode = await ensureUniqueCode(groupCode?.toUpperCase());
  const finalColor =
    color ||
    ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#9B8CFF", "#FF8FAB"][
      Math.floor(Math.random() * 6)
    ];

  const group = await GroupModel.create({
    name,
    teacher: teacherId,
    members: validMembers.map((m) => m._id),
    groupCode: finalCode,
    color: finalColor,
  });

  res.status(201).json(group);
});

export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { memberId } = req.body;

  const group = await GroupModel.findById(id);
  if (!group) {
    return res.status(404).json({ message: "Group not found." });
  }

  const member = await UserModel.findById(memberId);
  if (!member || member.role !== "student") {
    return res.status(400).json({ message: "Member must be a student." });
  }

  if (group.members.some((m) => m.toString() === memberId)) {
    return res.status(409).json({ message: "Student already in group." });
  }

  group.members.push(member._id);
  await group.save();

  res.json(group);
});

export const listGroups = asyncHandler(async (req: Request, res: Response) => {
  const { teacherId, memberId } = req.query;
  const filter: Record<string, unknown> = {};

  if (teacherId) filter.teacher = teacherId;
  if (memberId) filter.members = memberId;

  const groups = await GroupModel.find(filter)
    .populate("teacher", "name email role")
    .populate("members", "name email role")
    .lean();

  res.json(groups);
});

export const getGroup = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const group = await GroupModel.findById(id)
    .populate("teacher", "name email role")
    .populate("members", "name email role")
    .lean();

  if (!group) {
    return res.status(404).json({ message: "Group not found." });
  }

  res.json(group);
});

export const joinGroupByCode = asyncHandler(
  async (req: Request, res: Response) => {
    const { groupCode, memberId } = req.body as {
      groupCode: string;
      memberId: string;
    };

    const normalizedCode = groupCode.trim().toUpperCase();

    const group = await GroupModel.findOne({ groupCode: normalizedCode });
    if (!group) {
      return res.status(404).json({ message: "Group not found for that code." });
    }

    const member = await UserModel.findById(memberId);
    if (!member || member.role !== "student") {
      return res
        .status(400)
        .json({ message: "Only student accounts can join with a code." });
    }

    if (group.members.some((m) => m.toString() === memberId)) {
      return res.status(409).json({ message: "Already joined this group." });
    }

    group.members.push(member._id);
    await group.save();

    await group.populate([
      { path: "teacher", select: "name email role" },
      { path: "members", select: "name email role" },
    ]);

    res.json(group);
  },
);
