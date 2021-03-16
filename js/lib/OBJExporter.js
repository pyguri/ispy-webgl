/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.OBJExporter = function () {};

THREE.OBJExporter.prototype = {

	constructor: THREE.OBJExporter,

	parse: function ( object ) {

		var output = '';

		var indexVertex = 0;
		var indexVertexUvs = 0;
		var indexNormals = 0;

		var vertex = new THREE.Vector3();
		var normal = new THREE.Vector3();
		var uv = new THREE.Vector2();

		var i, j, k, l, m, face = [];

		var parseMesh = function ( mesh ) {

			var nbVertex = 0;
			var nbNormals = 0;
			var nbVertexUvs = 0;

			var geometry = mesh.geometry;

			var dontBuffer = geometry.dontBuffer;

			var normalMatrixWorld = new THREE.Matrix3();

			var vertices = undefined;
			var normals = undefined;
			var uvs = undefined;

			let faces = [];

			if (dontBuffer) {
				vertices = geometry.vertices;
				faces = geometry.faces;
			}

			if ( geometry instanceof THREE.Geometry ) {

				geometry = new THREE.BufferGeometry().setFromObject( mesh );

			}

			if ( geometry instanceof THREE.BufferGeometry ) {

				// shortcuts
				if (!dontBuffer){
					vertices = geometry.getAttribute( 'position' );
					normals = geometry.getAttribute('normal');
				}
				uvs = geometry.getAttribute('uv');

				console.log(uvs);

				var indices = geometry.getIndex();

				// name of the mesh object
				output += 'o ' + mesh.name + '\n';

				// name of the mesh material
				if ( mesh.material && mesh.material.name ) {
					output += 'usemtl ' + mesh.material.name + '\n';
				}

				// vertices

				if( vertices !== undefined ) {

					if (dontBuffer) {
						for (i = 0, l = vertices.length; i < l; i++, nbVertex++) {

							vertex = vertices[i];

							// transfrom the vertex to world space
							vertex.applyMatrix4(mesh.matrixWorld);

							// transform the vertex to export format
							output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

						}
					} else {
						for (i = 0, l = vertices.count; i < l; i++, nbVertex++) {

							vertex.x = vertices.getX(i);
							vertex.y = vertices.getY(i);
							vertex.z = vertices.getZ(i);

							// transfrom the vertex to world space
							vertex.applyMatrix4(mesh.matrixWorld);

							// transform the vertex to export format
							output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

						}
					}
				}

				// uvs

				if( uvs !== undefined ) {

					for ( i = 0, l = uvs.count; i < l; i ++, nbVertexUvs++ ) {

						uv.x = uvs.getX( i );
						uv.y = uvs.getY( i );

						// transform the uv to export format
						output += 'vt ' + uv.x + ' ' + uv.y + '\n';

					}

				}

				// normals

				if( normals !== undefined ) {

					normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );

					for ( i = 0, l = normals.count; i < l; i ++, nbNormals++ ) {

						normal.x = normals.getX( i );
						normal.y = normals.getY( i );
						normal.z = normals.getZ( i );

						// transfrom the normal to world space
						normal.applyMatrix3( normalMatrixWorld );

						// transform the normal to export format
						output += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';

					}

				}

				// faces

				if( indices !== null ) {

					for ( i = 0, l = indices.count; i < l; i += 3 ) {

						for( m = 0; m < 3; m ++ ){

							j = indices.getX( i + m ) + 1;

							face[ m ] = ( indexVertex + j ) + '/' + ( uvs ? ( indexVertexUvs + j ) : '' ) + '/' + ( indexNormals + j );

						}

						// transform the face to export format
						output += 'f ' + face.join( ' ' ) + "\n";

					}

				} else {

					if (dontBuffer) {
						var  k = 0;
						for (i = 0, l = faces.length; i < l; i++) {

							j = faces[i].a + 1;
							face[0] = (indexVertex + j) + '/' + (uvs ? (indexVertexUvs  + ++k) : '') + '/' + (normals ? indexNormals + j : '');
							j = faces[i].b + 1;
							face[1] = (indexVertex + j) + '/' + (uvs ? (indexVertexUvs  + ++k) : '') + '/' + (normals ? indexNormals + j : '');
							j = faces[i].c + 1;
							face[2] = (indexVertex + j) + '/' + (uvs ? (indexVertexUvs  + ++k) : '') + '/' + (normals ? indexNormals + j : '');

							// transform the face to export format
							output += 'f ' + face.join(' ') + "\n";
						}
					}else {
						for (i = 0, l = vertices.count; i < l; i += 3) {

							for (m = 0; m < 3; m++) {

								j = i + m + 1;

								face[m] = (indexVertex + j) + '/' + (uvs ? (indexVertexUvs + j) : '') + '/' + (indexNormals + j);

							}

							// transform the face to export format
							output += 'f ' + face.join(' ') + "\n";

						}
					}
				}

			} else {

				console.warn( 'THREE.OBJExporter.parseMesh(): geometry type unsupported', geometry );

			}

			// update index
			indexVertex += nbVertex;
			indexVertexUvs += nbVertexUvs;
			indexNormals += nbNormals;

		};

		var parseLine = function( line ) {

			var nbVertex = 0;

			var geometry = line.geometry;
			var type = line.type;

			if ( geometry instanceof THREE.Geometry ) {

				geometry = new THREE.BufferGeometry().setFromObject( line );

			}

			if ( geometry instanceof THREE.BufferGeometry ) {

				// shortcuts
				var vertices = geometry.getAttribute( 'position' );
				var indices = geometry.getIndex();

				// name of the line object
				output += 'o ' + line.name + '\n';

				if( vertices !== undefined ) {

					for ( i = 0, l = vertices.count; i < l; i ++, nbVertex++ ) {

						vertex.x = vertices.getX( i );
						vertex.y = vertices.getY( i );
						vertex.z = vertices.getZ( i );

						// transfrom the vertex to world space
						vertex.applyMatrix4( line.matrixWorld );

						// transform the vertex to export format
						output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

					}

				}

				if ( type === 'Line' ) {

					output += 'l ';

					for ( j = 1, l = vertices.count; j <= l; j++ ) {

						output += ( indexVertex + j ) + ' ';

					}

					output += '\n';

				}

				if ( type === 'LineSegments' ) {

					for ( j = 1, k = j + 1, l = vertices.count; j < l; j += 2, k = j + 1 ) {

						output += 'l ' + ( indexVertex + j ) + ' ' + ( indexVertex + k ) + '\n';

					}

				}

			} else {

				console.warn('THREE.OBJExporter.parseLine(): geometry type unsupported', geometry );

			}

			// update index
			indexVertex += nbVertex;

		};

		object.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh && child.visible) {

				parseMesh( child );

			}

			if ( child instanceof THREE.Line && child.visible) {

				parseLine( child );

			}

		} );

		return output;

	}

};
