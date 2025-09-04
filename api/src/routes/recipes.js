import express from 'express';
import { PrismaClient, RecipeIngredientType, IngredientLinkStatus } from '@prisma/client';
import auth from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

async function upsertByNamePerUser(model, name, userId) {
  if (!name?.trim()) return null;
  const existing = await prisma[model].findFirst({
    where: { name: name.trim(), createdByUserId: userId ?? null },
    select: { id: true },
  });
  if (existing) return existing.id;
  const created = await prisma[model].create({
    data: { name: name.trim(), createdByUserId: userId ?? null },
    select: { id: true },
  });
  return created.id;
}

async function upsertTags(names = [], userId) {
  const tagIds = [];
  for (const raw of names) {
    const name = (raw || '').trim();
    if (!name) continue;
    const existing = await prisma.recipeTag.findFirst({
      where: { name, createdByUserId: userId ?? null },
      select: { id: true },
    });
    if (existing) {
      tagIds.push(existing.id);
    } else {
      const created = await prisma.recipeTag.create({
        data: { name, createdByUserId: userId ?? null },
        select: { id: true },
      });
      tagIds.push(created.id);
    }
  }
  return tagIds;
}

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId ?? null;
    const { q, favorite, courseId, cuisineId, tag, take = 100, skip = 0 } = req.query;

    const where = {
      createdByUserId: userId,
      ...(favorite === 'true' ? { favorite: true } : {}),
      ...(courseId ? { courseId } : {}),
      ...(cuisineId ? { cuisineId } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { tags: { some: { tag: { name: { contains: q, mode: 'insensitive' } } } } },
            ],
          }
        : {}),
      ...(tag
        ? {
            tags: {
              some: { tag: { name: { equals: tag, mode: 'insensitive' }, createdByUserId: userId } },
            },
          }
        : {}),
    };

    const data = await prisma.recipe.findMany({
      where,
      orderBy: [{ title: 'asc' }],
      take: Number(take),
      skip: Number(skip),
      include: {
        course: true,
        cuisine: true,
        keyIngredient: true,
        tags: { include: { tag: true } },
      },
    });

    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.userId ?? null;
    const r = await prisma.recipe.findFirst({
      where: { id: req.params.id, createdByUserId: userId },
      include: {
        course: true,
        cuisine: true,
        keyIngredient: true,
        tags: { include: { tag: true } },
        ingredients: { orderBy: { idx: 'asc' }, include: { unit: true, product: true } },
        steps: { orderBy: { idx: 'asc' } },
      },
    });
    if (!r) return res.status(404).json({ error: 'Not found' });
    res.json(r);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

router.post('/', auth, async (req, res) => {
  const userId = req.userId ?? null;
  try {
    const {
      title,
      sourceUrl,
      description,
      servings,
      yields,
      favorite = false,
      imageUrl,
      courseId,
      courseName,
      cuisineId,
      cuisineName,
      keyIngredientId,
      keyIngredientText,
      tags = [],
      ingredients = [],
      steps = [],
    } = req.body;

    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });

    // slug
    let base = slugify(title);
    if (!base) base = 'recipe';
    let slug = base;
    let n = 1;
    while (
      await prisma.recipe.findFirst({
        where: { slug, createdByUserId: userId },
        select: { id: true },
      })
    ) {
      n += 1;
      slug = `${base}-${n}`;
    }

    const finalCourseId =
      courseId || (courseName ? await upsertByNamePerUser('recipeCourse', courseName, userId) : null);
    const finalCuisineId =
      cuisineId || (cuisineName ? await upsertByNamePerUser('recipeCuisine', cuisineName, userId) : null);

    const tagIds = await upsertTags(tags, userId);

    const created = await prisma.$transaction(async (tx) => {
      const recipe = await tx.recipe.create({
        data: {
          createdByUserId: userId,
          title: title.trim(),
          slug,
          sourceUrl: sourceUrl || null,
          description: description || null,
          servings: servings ?? null,
          yields: yields || null,
          favorite: !!favorite,
          imageUrl: imageUrl || null,
          courseId: finalCourseId,
          cuisineId: finalCuisineId,
          keyIngredientId: keyIngredientId || null,
          keyIngredientText: keyIngredientText || null,
          tags: { create: tagIds.map((id) => ({ tagId: id })) },
        },
      });

      if (Array.isArray(ingredients) && ingredients.length) {
        await tx.recipeIngredient.createMany({
          data: ingredients.map((row, idx) => ({
            recipeId: recipe.id,
            idx,
            type: row.type === 'HEADING' ? RecipeIngredientType.HEADING : RecipeIngredientType.ITEM,
            amount: row.amount ?? null,
            unitId: row.unitId ?? null,
            productId: row.productId ?? null,
            name: row.name ?? null,
            notes: row.notes ?? null,
            heading: row.heading ?? null,
            // ✅ wrap the || chain so it's not mixed with ??
            rawText:
              row.rawText ??
              (
                [row.amount, row.unit, row.name, row.notes].filter(Boolean).join(' ') ||
                row.heading ||
                row.name ||
                ''
              ),
            linkStatus: row.productId ? IngredientLinkStatus.LINKED : IngredientLinkStatus.PENDING,
            candidateName: row.candidateName ?? row.name ?? null,
          })),
        });
      }

      if (Array.isArray(steps) && steps.length) {
        await tx.recipeStep.createMany({
          data: steps.map((body, idx) => ({
            recipeId: recipe.id,
            idx,
            body: String(body ?? ''),
          })),
        });
      }

      return recipe.id;
    });

    const full = await prisma.recipe.findUnique({
      where: { id: created },
      include: {
        course: true,
        cuisine: true,
        keyIngredient: true,
        tags: { include: { tag: true } },
        ingredients: { orderBy: { idx: 'asc' }, include: { unit: true, product: true } },
        steps: { orderBy: { idx: 'asc' } },
      },
    });

    res.status(201).json(full);
  } catch (e) {
    console.error('Create recipe error', e);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

router.put('/:id', auth, async (req, res) => {
  const userId = req.userId ?? null;
  const { id } = req.params;
  try {
    const {
      title,
      sourceUrl,
      description,
      servings,
      yields,
      favorite,
      imageUrl,
      courseId,
      courseName,
      cuisineId,
      cuisineName,
      keyIngredientId,
      keyIngredientText,
      tags = [],
      ingredients = [],
      steps = [],
    } = req.body;

    const existing = await prisma.recipe.findFirst({
      where: { id, createdByUserId: userId },
      select: { id: true, slug: true, title: true },
    });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    // maybe update slug
    let updateSlug = undefined;
    if (title && title.trim() !== existing.title) {
      let base = slugify(title);
      if (!base) base = 'recipe';
      let slug = base;
      let n = 1;
      while (
        await prisma.recipe.findFirst({
          where: { slug, createdByUserId: userId, NOT: { id } },
          select: { id: true },
        })
      ) {
        n += 1;
        slug = `${base}-${n}`;
      }
      updateSlug = slug;
    }

    const finalCourseId =
      courseId || (courseName ? await upsertByNamePerUser('recipeCourse', courseName, userId) : null);
    const finalCuisineId =
      cuisineId || (cuisineName ? await upsertByNamePerUser('recipeCuisine', cuisineName, userId) : null);
    const tagIds = await upsertTags(tags, userId);

    await prisma.$transaction(async (tx) => {
      await tx.recipe.update({
        where: { id },
        data: {
          ...(title ? { title: title.trim() } : {}),
          ...(updateSlug ? { slug: updateSlug } : {}),
          sourceUrl: sourceUrl ?? null,
          description: description ?? null,
          servings: servings ?? null,
          yields: yields ?? null,
          favorite: typeof favorite === 'boolean' ? favorite : undefined,
          imageUrl: imageUrl ?? null,
          courseId: finalCourseId ?? null,
          cuisineId: finalCuisineId ?? null,
          keyIngredientId: keyIngredientId ?? null,
          keyIngredientText: keyIngredientText ?? null,
          tags: {
            deleteMany: {},
            create: (tagIds || []).map((tid) => ({ tagId: tid })),
          },
        },
      });

      await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
      if (Array.isArray(ingredients) && ingredients.length) {
        await tx.recipeIngredient.createMany({
          data: ingredients.map((row, idx) => ({
            recipeId: id,
            idx,
            type: row.type === 'HEADING' ? RecipeIngredientType.HEADING : RecipeIngredientType.ITEM,
            amount: row.amount ?? null,
            unitId: row.unitId ?? null,
            productId: row.productId ?? null,
            name: row.name ?? null,
            notes: row.notes ?? null,
            heading: row.heading ?? null,
            // ✅ same fix here
            rawText:
              row.rawText ??
              (
                [row.amount, row.unit, row.name, row.notes].filter(Boolean).join(' ') ||
                row.heading ||
                row.name ||
                ''
              ),
            linkStatus: row.productId ? IngredientLinkStatus.LINKED : IngredientLinkStatus.PENDING,
            candidateName: row.candidateName ?? row.name ?? null,
          })),
        });
      }

      await tx.recipeStep.deleteMany({ where: { recipeId: id } });
      if (Array.isArray(steps) && steps.length) {
        await tx.recipeStep.createMany({
          data: steps.map((body, idx) => ({ recipeId: id, idx, body: String(body ?? '') })),
        });
      }
    });

    const full = await prisma.recipe.findUnique({
      where: { id },
      include: {
        course: true,
        cuisine: true,
        keyIngredient: true,
        tags: { include: { tag: true } },
        ingredients: { orderBy: { idx: 'asc' }, include: { unit: true, product: true } },
        steps: { orderBy: { idx: 'asc' } },
      },
    });

    res.json(full);
  } catch (e) {
    console.error('Update recipe error', e);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

router.patch('/:id/favorite', auth, async (req, res) => {
  try {
    const userId = req.userId ?? null;
    const { id } = req.params;
    const recipe = await prisma.recipe.findFirst({ where: { id, createdByUserId: userId } });
    if (!recipe) return res.status(404).json({ error: 'Not found' });
    const updated = await prisma.recipe.update({ where: { id }, data: { favorite: !recipe.favorite } });
    res.json(updated);
  } catch (e) {
    console.error('Fav toggle error', e);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.userId ?? null;
    const { id } = req.params;
    const existing = await prisma.recipe.findFirst({ where: { id, createdByUserId: userId }, select: { id: true } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    await prisma.recipe.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    console.error('Delete recipe error', e);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

router.get('/_search/products', auth, async (req, res) => {
  try {
    const { q, take = 20 } = req.query;
    if (!q?.trim()) return res.json([]);
    const list = await prisma.product.findMany({
      where: { name: { contains: q.trim(), mode: 'insensitive' } },
      orderBy: { name: 'asc' },
      take: Number(take),
      select: { id: true, name: true, defaultUnitTypeId: true, categoryId: true },
    });
    res.json(list);
  } catch (e) {
    console.error('Product search error', e);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;