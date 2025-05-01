/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/** Kết quả node có thêm mảng con */
export type TreeNode<T, K extends string> = T & Record<K, TreeNode<T, K>[]>;

export interface BuildTreeOptions<T, K extends string = 'children'> {
	/** field chứa id (mặc định 'id') */
	idKey?: keyof T;
	/** field chứa parent (có thể là parentId: primitive hoặc parent: object) */
	parentKey?: keyof T;
	/** tên field sẽ giữ mảng con (mặc định 'children') */
	childrenKey?: K;
}

export function buildTree<
	T extends Record<string, any>,
	K extends string = 'children',
>(
	items: T[],
	{
		idKey = 'id' as keyof T,
		parentKey = 'parent' as keyof T,
		childrenKey = 'children' as K,
	}: BuildTreeOptions<T, K> = {},
): TreeNode<T, K>[] {
	const map = new Map<unknown, TreeNode<T, K>>();

	// Clone item và reset childrenKey = []
	const nodes = items.map((item) => {
		const node = {
			...item,
			[childrenKey]: [] as TreeNode<T, K>[],
		} as TreeNode<T, K>;
		map.set(node[idKey], node);
		return node;
	});

	const roots: TreeNode<T, K>[] = [];

	for (const node of nodes) {
		// Lấy rawParent: nếu là object thì lấy .id, còn primitive thì giữ nguyên
		const rawParent = node[parentKey];
		const parentId =
			rawParent && typeof rawParent === 'object'
				? (rawParent as any).id
				: rawParent;

		const parentNode = map.get(parentId);
		if (parentNode) {
			parentNode[childrenKey].push(node);
		} else {
			roots.push(node);
		}
	}

	return roots;
}
