using LocationTool.Models;
using System.Collections.Generic;
using System.Linq;

namespace LocationTool.Utilities
{
    public static class LootComparer
    {
        public static bool Compare(Loot loot, IEnumerable<Loot> multipleLoot)
        {
            List<Loot> existing;

            if (loot.Type == LootType.Forced)
            {
                existing = multipleLoot.Where(l => l.Type == LootType.Forced).ToList();
                return existing.Any(l => CompareItem(loot.Items[0], l.Items[0]));
            }

            if (loot.Type == LootType.Static)
            {
                existing = multipleLoot.Where(l => l.Id.Equals(loot.Id)).ToList();
                return existing.Any(l => CompareItems(loot, l));
            }

            // Dynamic Loot
            existing = multipleLoot.Where(l => l.Id.Equals(loot.Id)).ToList();
            return existing.Any(l => CompareDynamic(loot, l));
        }

        private static bool CompareDynamic(Loot loot, Loot existing)
        {
            return ComparePositionRotation(loot, existing) && CompareItems(loot, existing);
        }

        private static bool CompareItems(Loot loot1, Loot loot2)
        {
            if (loot2.Items.Count != loot1.Items.Count)
                return false;

            foreach (var item in loot1.Items)
            {
                if (!loot2.Items.Any(i => CompareItem(i, item)))
                    return false;
            }

            return true;
        }

        private static bool CompareItem(Item item1, Item item2)
        {
            return item1.Tpl.Equals(item2.Tpl) && item1.Count == item2.Count;
        }

        private static bool ComparePositionRotation(Loot loot1, Loot loot2)
        {
            return loot1.Position.X == loot2.Position.X
                && loot1.Rotation.X == loot2.Rotation.X
                && loot1.Position.Y == loot2.Position.Y
                && loot1.Rotation.Y == loot2.Rotation.Y
                && loot1.Position.Z == loot2.Position.Z
                && loot1.Rotation.Z == loot2.Rotation.Z;
        }
    }
}
