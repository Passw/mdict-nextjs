// Auto expandable read/write buffer of TypedArray
function FlexBuffer() {
    return {
        require: function (n) {
            var r = this.c - this.l + n;
            if (r > 0) {
                var tmp = new Uint8Array(this.l += this.blockSize * Math.ceil(r / this.blockSize));
                tmp.set(this.buf);
                this.buf = tmp;
            }
            this.c += n;
            return this.buf;
        },
        alloc: function (initSize, blockSize) {
            this.blockSize = this.roundUp(blockSize || 4096);
            this.c = 0;
            this.l = this.roundUp(initSize) | 0;
            this.l += this.blockSize - (this.l % this.blockSize);
            this.buf = new Uint8Array(this.l);
            return this.buf;
        },
        roundUp: function (n) {
            var r = n % 4;
            return r === 0 ? n : n + 4 - r;
        },
        reset: function () {
            this.c = 0;
            this.l = this.buf.length;
        },
        pack: function (size) {
            return this.buf.subarray(0, size);
        },
    };
}

const lzo1x = (function () {

    function decompress(inBuf, outBuf) {
        var c_top_loop = 1;
        var c_first_literal_run = 2;
        var c_match = 3;
        var c_copy_match = 4;
        var c_match_done = 5;
        var c_match_next = 6;

        var out = outBuf.buf,
            op = 0,
            ip = 0,
            t = inBuf[ip],
            state = c_top_loop,
            m_pos = 0,
            ip_end = inBuf.length;

        if (t > 17) {
            ip++;

            t -= 17;
            if (t < 4) {
                state = c_match_next;           // goto match_next;
            } else {
                out = outBuf.require(t);
                do {
                    out[op++] = inBuf[ip++];
                } while (--t > 0);
                state = c_first_literal_run;    // goto first_literal_run;
            }
        }

        top_loop_ori: do {
            var if_block = false;
            switch (state) {                    // while (true)  top_loop_ori
                case c_top_loop:
                    t = inBuf[ip++];
                    if (t >= 16) {
                        state = c_match;
                        continue top_loop_ori;  //goto match;
                    }
                    if (t === 0) {
                        while (inBuf[ip] === 0) {
                            t += 255;
                            ip++;
                        }
                        t += 15 + inBuf[ip++];
                    }

                    //s=3; do out[op++] = inBuf[ip++]; while(--s > 0);  //* (lzo_uint32 *)(op) = * (const lzo_uint32 *)(ip);op += 4; ip += 4;

                    t += 3;
                    out = outBuf.require(t);
                    do out[op++] = inBuf[ip++]; while (--t > 0);

                case c_first_literal_run:        /*first_literal_run: */
                    t = inBuf[ip++];
                    if (t >= 16) {
                        state = c_match;
                        continue top_loop_ori;  //goto match;
                    }
                    m_pos = op - 0x801 - (t >> 2) - (inBuf[ip++] << 2);
                    out = outBuf.require(3);
                    out[op++] = out[m_pos++];
                    out[op++] = out[m_pos++];
                    out[op++] = out[m_pos];

                    state = c_match_done;
                    continue top_loop_ori;    //goto match_done;

                case c_match:
                    //do {
                    //match:
                    if (t >= 64) {
                        m_pos = op - 1 - ((t >> 2) & 7) - (inBuf[ip++] << 3);
                        t = (t >> 5) - 1;
                        state = c_copy_match;
                        continue top_loop_ori; //goto copy_match;

                    } else if (t >= 32) {
                        t &= 31;
                        if (t === 0) {
                            while (inBuf[ip] === 0) {
                                t += 255;
                                ip++;
                            }
                            t += 31 + inBuf[ip++];
                        }
                        m_pos = op - 1 - ((inBuf[ip] + (inBuf[ip + 1] << 8)) >> 2);

                        ip += 2;
                    } else if (t >= 16) {
                        m_pos = op - ((t & 8) << 11);
                        t &= 7;
                        if (t === 0) {
                            while (inBuf[ip] === 0) {
                                t += 255;
                                ip++;
                            }
                            t += 7 + inBuf[ip++];
                        }
                        m_pos -= ((inBuf[ip] + (inBuf[ip + 1] << 8)) >> 2); //m_pos -= (* (const unsigned short *) ip) >> 2;
                        ip += 2;
                        if (m_pos === op) {
                            break top_loop_ori;   //goto eof_found;
                        }
                        m_pos -= 0x4000;
                    } else {
                        m_pos = op - 1 - (t >> 2) - (inBuf[ip++] << 2);
                        out = outBuf.require(2);
                        out[op++] = out[m_pos++];
                        out[op++] = out[m_pos];
                        state = c_match_done;
                        continue top_loop_ori;  //goto match_done;
                    }
                    if (t >= 6 && (op - m_pos) >= 4) {
                        if_block = true;
                        t += 2;
                        out = outBuf.require(t);
                        do out[op++] = out[m_pos++]; while (--t > 0);
                    }

                case c_copy_match:
                    if (!if_block) {
                        t += 2;
                        out = outBuf.require(t);
                        do out[op++] = out[m_pos++]; while (--t > 0);
                    }

                case c_match_done:
                    t = inBuf[ip - 2] & 3;
                    if (t === 0) {
                        state = c_top_loop;
                        continue top_loop_ori;   //break;
                    }

                case c_match_next:
                    out = outBuf.require(1);
                    out[op++] = inBuf[ip++];
                    if (t > 1) {
                        out = outBuf.require(1);
                        out[op++] = inBuf[ip++];
                        if (t > 2) {
                            out = outBuf.require(1);
                            out[op++] = inBuf[ip++];
                        }
                    }
                    t = inBuf[ip++];
                    state = c_match;
                    continue top_loop_ori;

            }
        } while (true);

        return outBuf.pack(op);
    }


    return {
        /**
         * Decompress LZO compressed data.
         * Usage:
         *   result = lzo.decompress(input);
         *   result = lzo.decompress(input, {initSize: 16000, blockSize: 8192});
         *   result = lzo.decompress(input, initSize, blockSize);
         * or
         *   var output = lzo.createFlexBuffer(initSize, blockSize);
         *   result = lzo.decompress(input, output);  // which output FlexBuffer can be resued to improve performance
         * @param input ArrayBuffer or Uint8Array object containing LZO compressed data.
         * @param second argument
         *          options {initSize: .., blockSize: ..} object, used to create output FlexBuffer
         *          initSize number of initial size for output buffer (at least length of input buffer whether missing or a lesser value)
         *          output a re-usable FlexBuffer object which can be used to improve performance
         * @param blockSize optional third argument block size used to extend output ArrayBuffer, default is 8192
         * @return Uint8Array containing decompressed data. For performance reason, its underground ArrayBuffer
         *         is not truncated to the same size of output data, which can be accessed through TypedArray.prototype.buffer.
         */
        decompress: function (input, options, blockSize) {
            var output;
            if (options.require instanceof Function) {
                output = options;
                output.reset();
            } else {
                if (typeof options === 'number') {
                    options = {initSize: options, blockSize: blockSize || 8192};
                }
                output = this.createFlexBuffer(options.initSize || input.length, options.blockSize || 8192);
            }
            return decompress(input, output);
        },
        createFlexBuffer: function (initSize, blockSize) {
            var output = FlexBuffer();
            output.alloc(initSize, blockSize);
            return output;
        }
    };
})()

exports.lzo1x = lzo1x