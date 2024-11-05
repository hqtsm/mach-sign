import { assertEquals } from '@std/assert';

import {
	chunkedHashes,
	type FixtureMachoSignatureInfo,
	hash,
	unhex,
} from '../util.spec.ts';
import { cdInfoSlot, cdRequirementsSlot, cdResourceDirSlot } from '../const.ts';

import { CodeDirectoryBuilder } from './codedirectorybuilder.ts';
import { CodeDirectory } from './codedirectory.ts';

export const emptyRequirements = unhex('FA DE 0C 01 00 00 00 0C 00 00 00 00');

export async function addCodeHashes(
	cd: CodeDirectoryBuilder,
	macho: Readonly<Uint8Array>,
): Promise<void> {
	const { pageSize } = cd;
	const hashes = await chunkedHashes(
		cd.hashType,
		macho,
		pageSize,
		0,
		cd.execLength,
	);
	for (let i = hashes.length; i--;) {
		cd.setCodeSlot(i, hashes[i]);
	}
}

export async function* createCodeDirectories(
	info: Readonly<FixtureMachoSignatureInfo>,
	thin: Readonly<Uint8Array>,
	infoPlist: Readonly<Uint8Array> | null,
	codeResources: Readonly<Uint8Array> | null,
): AsyncGenerator<CodeDirectory> {
	const { requirements } = info;
	for (const hashType of info.hashes) {
		const identifier = new TextEncoder().encode(info.identifier);
		const teamID = new TextEncoder().encode(info.teamid);
		const builder = new CodeDirectoryBuilder(hashType);
		builder.flags = info.flags;
		builder.execLength = info.offset;
		builder.pageSize = info.page;
		builder.execSegOffset = BigInt(info.execsegbase);
		builder.execSegLimit = BigInt(info.execseglimit);
		builder.execSegFlags = BigInt(info.execsegflags);
		builder.identifier = new Int8Array(
			identifier.buffer,
			identifier.byteOffset,
			identifier.byteLength,
		);
		builder.teamID = new Int8Array(
			teamID.buffer,
			teamID.byteOffset,
			teamID.byteLength,
		);
		if (infoPlist) {
			builder.setSpecialSlot(
				cdInfoSlot,
				// deno-lint-ignore no-await-in-loop
				await hash(hashType, infoPlist),
			);
		}
		switch (requirements) {
			case '': {
				// No requirements.
				break;
			}
			case 'count=0 size=12': {
				builder.setSpecialSlot(
					cdRequirementsSlot,
					// deno-lint-ignore no-await-in-loop
					await hash(hashType, emptyRequirements),
				);
				break;
			}
			default: {
				throw new Error(`Unknown requirements: ${requirements}`);
			}
		}
		if (codeResources) {
			builder.setSpecialSlot(
				cdResourceDirSlot,
				// deno-lint-ignore no-await-in-loop
				await hash(hashType, codeResources),
			);
		}
		// deno-lint-ignore no-await-in-loop
		await addCodeHashes(builder, thin);

		// Offical library always minimum supports scatter.
		assertEquals(
			Math.max(builder.version, CodeDirectory.supportsScatter),
			info.version,
		);

		yield builder.build(info.version);
	}
}
