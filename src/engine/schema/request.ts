import { t } from "elysia";

export const ColorRGB = t.Object({
    r: t.Number(),
    g: t.Number(),
    b: t.Number(),
});

export const ComposedColor = t.Array(ColorRGB);

export const TextureObject = t.Object({
    id: t.String(),
    hash: t.String(),
    uploader: t.String(),
});

export const Illustration = t.Object({
    id: t.Number(),
    objectId: t.String(),
    displayName: t.String(),
    tags: t.Array(t.String()),
});

export const Specy = t.Object({
    id: t.Number(),
    displayName: t.String(),
    parents: t.Array(t.Number()),
});

export const Character = t.Object({
    id: t.Number(),
    createdBy: t.String(),
    tags: t.Array(t.String()),
    illustrations: t.Array(t.Number()),
    displayName: t.String(),
    isDied: t.Boolean(),
    isFemale: t.Boolean(),
    information: t.Object({
        background: t.String(),
        sources: t.Array(t.String()),
        personality: t.String(),
        description: t.String(),
    }),
    specy: t.Union([t.Array(t.Number()), t.Number()]),
    height: t.Number(),
    length: t.Number(),
    color: t.Object({
        fur: ComposedColor,
        eye: ComposedColor,
        other: t.Record(t.String(), ComposedColor),
    }),
    relationShips: t.Object({
        parents: t.Array(t.Number()),
        friends: t.Array(t.Number()),
        children: t.Array(t.Number()),
        other: t.Record(t.String(), t.Array(t.Number())),
    }),
});

export const CharacterCreation = t.Omit(Character, ["id", "createdBy", "illustrations"]);
