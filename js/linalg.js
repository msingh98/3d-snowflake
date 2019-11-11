class Mat {
    /**
     * Represents a matrix!
     * 
     * @param {number[][]} entries The entries of the matrix, as an array of arrays
     * in row major order
     */
    constructor(entries) {
        this.rows = entries.length;
        this.cols = entries[0].length;
        this.entries = entries
    }

    /**
     * Constructs a 4x4 identity matrix
     */
    static identity() {
        return new Mat([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        ]);
    }

    /**
     * Constructs a matrix which produces a transation by the vector v.
     * @param {number[]} v the vector to translate by (vec3)
     */
    static translation(v) {
        return new Mat([
            [1, 0, 0, v[0]],
            [0, 1, 0, v[1]],
            [0, 0, 1, v[2]],
            [0, 0, 0, 1],
        ]);
    }

    /**
     * Constructs a matrix representing right-handed rotation about an axis by a given angle. For more
     * details, see:
     * https://en.wikipedia.org/wiki/Quaternions_and_spatial_rotation#Quaternion-derived_rotation_matrix
     * 
     * @param {number} theta the angle to rotate by
     * @param {number[]} v a vector that defines the axis of rotation (vec3)
     */
    static rotation(theta, v) {
        const vp = Vec.scale(Vec.normalize(v), Math.sin(theta/2));
        const u = [Math.cos(theta/2), vp[0], vp[1], vp[2]];

        return new Mat([
            [1 - 2*(u[2]*u[2] + u[3]*u[3]),  2*(u[1]*u[2] - u[3]*u[0]),     2*(u[1]*u[3] + u[2]*u[0]),     0],
            [2*(u[1]*u[2] + u[3]*u[0]),      1 - 2*(u[1]*u[1] + u[3]*u[3]), 2*(u[2]*u[3] - u[1]*u[0]),     0],
            [2*(u[1]*u[3] - u[2]*u[0]),      2*(u[2]*u[3] + u[1]*u[0]),     1 - 2*(u[1]*u[1] + u[2]*u[2]), 0],
            [0,                              0,                         0,                                 1],
        ])
    }

    /**
     * Construct and return a new matrix given by self + B
     * @param {*} B the matrix to add
     */
    add(B) {
        let C = new Array(this.rows);

        for(let i=0; i<this.rows; i++) {
            C[i] = new Array(this.cols);
            for(let j=0; j<B.cols; j++) {
                C[i][j] = this.entries[i][j] + B.entries[i][j];
            }
        }

        return new Mat(C);
    }

    /**
     * Construct and return a new matrix given by self * B
     * @param {Mat} B the matrix to right-multiply by
     */
    mul(B) {
        let C = new Array(this.rows);

        for(let i=0; i<this.rows; i++) {
            C[i] = new Array(B.cols);
            for(let j=0; j<B.cols; j++) {
                C[i][j] = 0;
                for(let k=0; k<this.cols; k++) {
                    C[i][j] += this.entries[i][k] * B.entries[k][j];
                }
            }
        }

        return new Mat(C);
    }

    convertForGPU() {
        let C = new Float32Array(this.rows * this.cols);

        for(let i=0; i<this.rows; i++) {
            for(let j=0; j<this.cols; j++) {
                C[j*this.rows + i] = this.entries[i][j];
            }
        }

        return C;
    }
}

class Vec {
    /**
     * Compute the cross product of u and v.
     * @param {number[]} u a 3-vector or homogeneous 4-vector
     * @param {number[]} v a 3-vector or homogeneous 4-vector
     */
    static cross(u, v) {
        return [
            u[1]*v[2] - u[2]*v[1],
            u[2]*v[0] - u[0]*v[2],
            u[0]*v[1] - u[1]*v[0],
        ];
    }

    /**
     * Compute the dot product of u and v.
     * @param {number[]} u 
     * @param {number[]} v 
     */
    static dot(u, v) {
        let s = 0;

        for(let i=0; i<u.length; i++) {
            s += u[i] * v[i];
        }

        return s;
    }

    /**
     * Compute the length (Euclidean norm) of the vector.
     * @param {*} v 
     */
    static norm(v) {
        let s = 0;
        
        for(let i=0; i<v.length; i++) {
            s += v[i]**2
        }

        return Math.sqrt(s);
    }

    /**
     * Compute a unit vector in the direction of v.
     * @param {number[]} v 
     */
    static normalize(v) {
        return this.scale(v, 1/this.norm(v));
    }

    /**
     * Scale the vector v by the number r.
     * @param {number[]} v 
     * @param {number} r 
     */
    static scale(v, r) {
        let u = new Array(v.length);

        for(let i=0; i<u.length; i++) {
            u[i] = v[i] * r;
        }

        return u;
    }
}
