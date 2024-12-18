import { Struct, structU32, structU64 } from '../struct.ts';

/**
 * Entry point command.
 */
export class EntryPointCommand extends Struct {
	declare public readonly ['constructor']: typeof EntryPointCommand;

	/**
	 * Command type.
	 */
	declare public cmd: number;

	/**
	 * Command size.
	 */
	declare public cmdsize: number;

	/**
	 * File __TEXT offset of main entry point.
	 */
	declare public entryoff: bigint;

	/**
	 * Initial stack size, if non-zero.
	 */
	declare public stacksize: bigint;

	/**
	 * @inheritdoc
	 */
	public static override readonly BYTE_LENGTH: number = ((o) => {
		o += structU32(this, o, 'cmd');
		o += structU32(this, o, 'cmdsize');
		o += structU64(this, o, 'entryoff');
		o += structU64(this, o, 'stacksize');
		return o;
	})(super.BYTE_LENGTH);
}
