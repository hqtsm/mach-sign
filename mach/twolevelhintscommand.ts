import { Struct, structU32 } from '../struct.ts';

/**
 * Two-level namespace lookup hints table command.
 */
export class TwolevelHintsCommand extends Struct {
	declare public readonly ['constructor']: typeof TwolevelHintsCommand;

	/**
	 * Command type.
	 */
	declare public cmd: number;

	/**
	 * Command size.
	 */
	declare public cmdsize: number;

	/**
	 * Hints table offset.
	 */
	declare public offset: number;

	/**
	 * Number of hints in table.
	 */
	declare public nhints: number;

	/**
	 * @inheritdoc
	 */
	public static override readonly BYTE_LENGTH: number = ((o) => {
		o += structU32(this, o, 'cmd');
		o += structU32(this, o, 'cmdsize');
		o += structU32(this, o, 'offset');
		o += structU32(this, o, 'nhints');
		return o;
	})(super.BYTE_LENGTH);
}
