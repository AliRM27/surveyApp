import { Request, Response } from 'express';
import { GroupModel } from '../models/group.model';
import { UserModel } from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';

export const createGroup = asyncHandler(async (req: Request, res: Response) => {
  const { name, teacherId, memberIds = [] } = req.body;

  const teacher = await UserModel.findById(teacherId);
  if (!teacher || teacher.role !== 'teacher') {
    return res.status(400).json({ message: 'Teacher not found or invalid.' });
  }

  const validMembers = await UserModel.find({
    _id: { $in: memberIds },
    role: 'student'
  }).select('_id');

  const group = await GroupModel.create({
    name,
    teacher: teacherId,
    members: validMembers.map((m) => m._id)
  });

  res.status(201).json(group);
});

export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { memberId } = req.body;

  const group = await GroupModel.findById(id);
  if (!group) {
    return res.status(404).json({ message: 'Group not found.' });
  }

  const member = await UserModel.findById(memberId);
  if (!member || member.role !== 'student') {
    return res.status(400).json({ message: 'Member must be a student.' });
  }

  if (group.members.some((m) => m.toString() === memberId)) {
    return res.status(409).json({ message: 'Student already in group.' });
  }

  group.members.push(member._id);
  await group.save();

  res.json(group);
});

export const listGroups = asyncHandler(async (req: Request, res: Response) => {
  const { teacherId } = req.query;
  const filter = teacherId ? { teacher: teacherId } : {};

  const groups = await GroupModel.find(filter)
    .populate('teacher', 'name email role')
    .populate('members', 'name email role')
    .lean();

  res.json(groups);
});

export const getGroup = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const group = await GroupModel.findById(id)
    .populate('teacher', 'name email role')
    .populate('members', 'name email role')
    .lean();

  if (!group) {
    return res.status(404).json({ message: 'Group not found.' });
  }

  res.json(group);
});
